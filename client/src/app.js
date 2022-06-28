import { INFO, ALLOWED_TYPE, CHUNK_SIZE, API } from "./config";
// 立即执行函数，可以将docment参数注入到内部函数中形成闭包，以达到简写的效果
((d) => {
  // 获取dom元素
  const oUploader = d.querySelector("#videoUploader");
  const oBtn = d.querySelector("#uploadBtn");
  const oProgress = d.querySelector("#uploadProgress");
  const oInfo = d.querySelector("#uploadInfo");
  // 记录当前上传大小
  let uploadedSize = 0;

  // 绑定事件函数
  function bindEvent() {
    oBtn.addEventListener("click", upload);
  }

  // 上传事件函数
  async function upload() {
    // 解构取出上传的文件
    const {
      files: [file],
    } = oUploader;
    // 判空处理
    if (!file) {
      oInfo.innerHTML = INFO["NO-FILE-FOND"];
      return;
    }
    // 解构取出上传文件的信息
    const { name, size, type } = file;
    // 上传类型限制
    if (!ALLOWED_TYPE[type]) {
      oInfo.innerHTML = INFO["TYPE_ERROR"];
      return;
    }

    // 校验通过，开始上传
    // 同步进度条最大值
    oProgress.max = size;
    // 清空错误提示
    oInfo.innerHTML = "";
    // 上传文件名
    const fileName = new Date().getTime() + "_" + name;
    let response = null;

    // 利用while循环切片并发送请求
    while (uploadedSize < size) {
      const fileChunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE);
      console.log(fileChunk);
      const formData = createFormData({
        name,
        fileName,
        type,
        size,
        uploadedSize,
        chunk: fileChunk,
      });
      // axios发送请求
      try {
        response = await axios.post(API, formData);
      } catch (error) {
        oInfo.innerHTML = INFO["UPLOAD_FAILED"] + error.message;
        return;
      }
      // chunk上传结束后，更新已上传的size，并同步进度条
      uploadedSize += fileChunk.size;
      oProgress.value = uploadedSize;
    }

    // 全部chunk上传结束后，显示成功，清空数据
    oInfo.innerHTML = INFO["UPLOAD_SUCCESS"];
    oUploader.value = null;
  }

  // 构造请求参数的函数
  function createFormData({ name, fileName, type, size, uploadedSize, chunk }) {
    const postData = new FormData();
    postData.append("name", name);
    postData.append("fileName", fileName);
    postData.append("type", type);
    postData.append("size", size);
    postData.append("uploadedSize", uploadedSize);
    postData.append("chunk", chunk);
    return postData;
  }

  function init() {
    bindEvent();
  }
  init();
})(document);
