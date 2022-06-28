const express = require("express");
// 请求体数据处理中间件
const bodyParser = require("body-parser");
const uploader = require("express-fileupload");
// extname是获取文件后缀名的
const { extname, resolve } = require("path");
// existsSync检查文件是否存在; appendFileSync同步添加数据
const { existsSync, appendFileSync, writeFileSync } = require("fs");

const app = express();

// 解析并返回的请求体对象配置为任意类型
app.use(bodyParser.urlencoded({ extended: true }));
// 解析json格式的请求体
app.use(bodyParser.json());
// 请求体中上传数据的处理，返回的数据在req.files中
app.use(uploader());

// 跨域处理
app.all("*", (_, res, next) => {
  res.header("Access-Control-Allow-origin", "*");
  res.header("Access-Control-Allow-methods", "POST,GET");
  next();
});

// 处理上传响应
app.post("/upload_video", (req, res, next) => {
  const { name, fileName, uploadedSize } = req.body;
  const { chunk } = req.files;
  // 判空处理
  if (!chunk) {
    res.send({
      code: 1001,
      msg: "No file Fond",
    });
    return;
  }
  // 处理fileName 添加后缀名
  const filename = fileName + extname(name);
  // 声明文件保存路径
  const filePath = resolve(__dirname, "./upload_tem/" + filename);

  // 根据uploadedSize判断新建或追加数据文件
  if (uploadedSize !== "0") {
    // 注意是字符串0
    if (!existsSync(filePath)) {
      res.send({
        code: 1002,
        msg: "No file exists",
      });
      return;
    }
    // append数据到文件，结束本次上传
    appendFileSync(filePath, chunk.data);
    res.send({ code: 200, msg: "chunk appended" });
    return;
  }
  // 如果uploadedSize为0，表示没有正在上传的数据
  // 则创建并写入这个文件
  writeFileSync(filePath, chunk.data);
  res.send({ code: 200, msg: "file created" });
});

// 开启服务器 监听8000端口
app.listen(8000, () => {
  console.log("Server is running");
});
