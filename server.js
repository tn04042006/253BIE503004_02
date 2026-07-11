const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 1. PHỤC VỤ FILE TĨNH (HTML, CSS, JS, Images)
app.use(express.static(__dirname)); 
app.use('/images', express.static(path.join(__dirname, 'images')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 2. KẾT NỐI MONGODB ATLAS 
const atlasURI = "mongodb://admin:matmo123@ac-qmhb25d-shard-00-00.fmw3viq.mongodb.net:27017,ac-qmhb25d-shard-00-01.fmw3viq.mongodb.net:27017,ac-qmhb25d-shard-00-02.fmw3viq.mongodb.net:27017/Noidungsanpham?ssl=true&replicaSet=atlas-g2fzax-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(atlasURI)
    .then(() => console.log(" Đã kết nối MongoDB ATLAS thành công!"))
    .catch(err => console.log(" Lỗi kết nối Atlas: " + err));

// --- 3. API SẢN PHẨM (Lấy tất cả + Bộ lọc) ---
app.get("/api/products", async (req, res) => {
    try {
        let query = {};
        const { loai_trong, khoang_gia, kieu_dang, dang_mat, xu_huong } = req.query;

        if (loai_trong) query["bo_loc.loai_trong"] = { $in: loai_trong.split(',') };
        if (kieu_dang) query["bo_loc.kieu_dang_gong"] = { $in: kieu_dang.split(',') };
        if (dang_mat) query["bo_loc.dang_mat"] = { $in: dang_mat.split(',') };
        
        if (xu_huong) query["bo_loc.xu_huong"] = { $in: xu_huong.split(',') }; 

        if (khoang_gia) {
            if (khoang_gia === "<300k") query.gia = { $lt: 300000 };
            else if (khoang_gia === "300k-500k") query.gia = { $gte: 300000, $lte: 500000 };
            else if (khoang_gia === "500k-1000k") query.gia = { $gte: 500000, $lte: 1000000 };
            else if (khoang_gia === ">1000k") query.gia = { $gt: 1000000 };
        }

        const products = await mongoose.connection.db.collection("products").find(query).toArray();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 4. API CHI TIẾT SẢN PHẨM (Tìm theo mã SP1, SP2...)
app.get("/api/products/:id", async (req, res) => {
    try {
        const data = await mongoose.connection.db.collection("products").findOne({ ma_sp: req.params.id });
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- 5. API ĐÁNH GIÁ (Reviews) ----------------

// Lấy đánh giá của 1 sản phẩm
app.get("/api/reviews/:id", async (req, res) => {
    try {
        const data = await mongoose.connection.db.collection("reviews")
            .find({ ma_san_pham: req.params.id })
            .sort({ ngay_tao: -1 }).toArray();
        res.json(data);
    } catch (err) {
        res.json([]);
    }
});

// Gửi đánh giá mới (Real-time)
app.post("/api/reviews", async (req, res) => {
    try {
        const reviewMoi = {
            ...req.body,
            ngay_tao: new Date(),
            phan_hoi_cua_shop: "" // Mặc định shop chưa phản hồi
        };
        const result = await mongoose.connection.db.collection("reviews").insertOne(reviewMoi);
        reviewMoi._id = result.insertedId;

        // Gửi tín hiệu cho tất cả máy đang xem trang chi tiết
        io.emit("co_danh_gia_moi", reviewMoi); 
        res.json({ success: true, data: reviewMoi });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ---------------- 6. KHỞI CHẠY SERVER ----------------
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`
     SERVER MẮT MƠ ĐÃ SẴN SÀNG!
    ---------------------------------------------------
     Trang sản phẩm:  http://localhost:${PORT}/sp.html
     API Kiểm tra:    http://localhost:${PORT}/api/products
     Database:        MongoDB Atlas (Cloud)
    ---------------------------------------------------
    `);
});