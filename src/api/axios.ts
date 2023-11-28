import axios from "axios";
import * as vscode from "vscode";
import {saveObj} from "../utils/test";

let store = {
  context: null as vscode.ExtensionContext | null,
  fontColor: null as vscode.ExtensionContext | null,
};

console.log("windowState", vscode.window.state);
const instance = axios.create({
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36 FS",
    cookie: "",
    origin: "tieba.baidu.com",
    host: "tieba.baidu.com",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  },
});

instance.interceptors.request.use((config) => {
  console.log("请求：", config);
  return config;
});

instance.interceptors.response.use(
  (res) => {
    console.log("响应：", res);
    // 响应set-cookie
    if (res.headers["set-cookie"]) {
      console.log("response setCookie: ", res.headers["set-cookie"]);
      // const cookieList: string[] = res.headers['set-cookie']
      // let currentCookieObj = parseCookie(instance.defaults.headers.cookie)
      // cookieList.forEach(item => {
      //   currentCookieObj = Object.assign(currentCookieObj, parseCookie(item))
      // })
      // const cookieStr = stringifyCookie(currentCookieObj)
      // setCookie(cookieStr)
    }
    if (/static\/captcha\/tuxing\.html/.test(res.request.path)) {
      console.error("触发百度安全验证");
      vscode.window.showErrorMessage(
        "触发百度安全验证，请打开浏览器验证，并重新获取cookie"
      );
    }
    return res;
  },
  (res) => {
    console.log("响应error：", res);
    return res;
  }
);

export default instance;

export function setCookie(cookie: string, context?: vscode.ExtensionContext) {
  // saveObj(parseCookie(cookie))
  instance.defaults.headers.cookie = cookie;
  if (context) {
    // 首次传入context
    store.context = context;
  } else {
    // 修改cookie
    store.context && store.context.globalState.update("cookie", cookie);
  }
}

export function setFontColor(
  fontColor: string,
  context?: vscode.ExtensionContext
) {
  if (context) {
    // 首次传入context
    store.fontColor = context;
  } else {
    // fontColor
    store.fontColor &&
    store.fontColor.globalState.update("fontColor", fontColor);
  }
}

export function getStoreFontColor() {
  console.log("getStoreFontColor", store.fontColor);
  console.log(
    "getStoreFontColor",
    store.fontColor?.globalState.get("fontColor")
  );
  return store.fontColor && store.fontColor.globalState.get("fontColor");
}

// string => obj
function parseCookie(cookie: string) {
  const cookieObj: Record<string, string> = {};
  cookie.split(";").forEach((item) => {
    const keyValue = item.split("=");
    if (keyValue.length < 2) {
      return;
    }
    const [key, value] = keyValue;
    const keyNotCookie = ["path", "expires", "domain", "max-age"];
    if (!keyNotCookie.includes(key.trim().toLowerCase())) {
      cookieObj[key.trim()] = value.trim();
    }
  });
  return cookieObj;
}

// obj => string
function stringifyCookie(obj: object) {
  return Object.entries(obj)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join(";");
}
