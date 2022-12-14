const express = require("express");
const Router = require("./routes/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true
}));
  
app.use("/", Router);  
  
app.get("/", (req, res) => {
    res.status(200).json({ message :"메인화면" })
})

module.exports = app;

app.listen(8000, () => {
  console.log(8000, "포트로 서버가 열렸어요!");
});
