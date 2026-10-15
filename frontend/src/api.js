import { studentIdError } from "./validation";
export const isDemo = import.meta.env.VITE_DATA_MODE !== "api";
export const categories = {
  id_card: "證件",
  electronics: "3C 電子",
  wallet: "錢包",
  key: "鑰匙",
  clothing: "衣物配件",
  stationery: "書籍文具",
  bottle_umbrella: "水壺雨傘",
  other: "其他",
};
const seed = [
  [
    "米白色無線耳機",
    "electronics",
    "圖書館 2 樓自習區",
    "耳機盒外有一個小小的刮痕，拾獲時放在靠窗的桌上。",
    "earbuds",
    "2026-10-13T14:20",
  ],
  [
    "藍色保溫水壺",
    "bottle_umbrella",
    "工程五館 E5-101",
    "藍色瓶身、深色瓶蓋，瓶底有使用痕跡。",
    "bottle",
    "2026-10-13T12:10",
  ],
  [
    "一串鑰匙與綠色吊飾",
    "key",
    "松苑餐廳門口",
    "兩把鑰匙，附有綠色布質吊飾。",
    "keys",
    "2026-10-13T11:30",
  ],
  [
    "黑色皮革短夾",
    "wallet",
    "依仁堂體育館",
    "黑色對折短夾，請向拾獲者描述內容物以確認身分。",
    "wallet",
    "2026-10-12T18:05",
  ],
  [
    "深藍色折疊傘",
    "bottle_umbrella",
    "教研大樓 1 樓",
    "深藍色三折傘，附同色傘套。",
    "umbrella",
    "2026-10-12T16:40",
  ],
  [
    "咖啡色筆記本",
    "stationery",
    "綜教館 O-204",
    "牛皮紙封面，內頁有手寫筆記。",
    "book",
    "2026-10-12T10:15",
  ],
  [
    "灰色連帽外套",
    "clothing",
    "操場看台",
    "灰色棉質連帽外套，已交給服務台。",
    "clothing",
    "2026-10-11T17:00",
  ],
  [
    "學生證",
    "id_card",
    "中大湖步道",
    "已協助確認並歸還本人。",
    "card",
    "2026-10-11T09:00",
  ],
].map(([title, category, found_location, description, art, found_at], i) => ({
  id: i + 1,
  title,
  category,
  found_location,
  description,
  art,
  found_at,
  status: i === 7 ? "returned" : "open",
  returned_at: i === 7 ? "2026-10-11T10:30:00+08:00" : null,
  author_name: "校園拾獲者",
  contact: "示範聯絡方式（非真實資料）",
  storage_location: "請先聯絡拾獲者確認",
  user_id: 0,
  image_url: null,
}));
let posts = [...seed];
let user = null;
let nextId = 20;
const accounts = new Map();
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
async function request(path, method = "GET", data) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "include",
      headers:
        data && !(data instanceof FormData)
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
    });
  } catch {
    throw new ApiError("無法連線，請確認網路後再試一次。", 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      {
        401: "登入已失效或帳號密碼不正確，請重新登入。",
        403: "你沒有修改這篇刊登的權限。",
        404: "找不到這筆資料，可能已被刪除。",
        409: "這個帳號已有人使用，請換一個帳號。",
        413: "照片超過 5 MB，請選擇較小的檔案。",
      }[response.status] ||
        body.error ||
        "服務暫時無法使用，請稍後重試。",
      response.status,
    );
  return body;
}
const owned = (id) => {
  const post = posts.find((p) => p.id === id);
  if (!post) throw new ApiError("找不到這筆資料。", 404);
  if (!user || post.user_id !== user.id)
    throw new ApiError("沒有修改權限。", 403);
  return post;
};
const demoPost = (post) => ({
  ...post,
  contact_override: post.contact || null,
  contact: post.contact || accounts.get(post.author_username)?.contact || "",
  author_name:
    accounts.get(post.author_username)?.display_name || post.author_name,
});
export const api = {
  async me() {
    return isDemo ? user : request("/auth/me");
  },
  async auth(mode, data) {
    if (!isDemo) return request(`/auth/${mode}`, "POST", data);
    if (mode === "register") {
      const invalid = studentIdError(data.username);
      if (invalid) throw new ApiError(invalid, 400);
      if (!data.password || data.password.length < 6)
        throw new ApiError("密碼至少需要 6 個字元。", 400);
      if (accounts.has(data.username))
        throw new ApiError("這個帳號已有人使用。", 409);
      accounts.set(data.username, { ...data, id: nextId++ });
    }
    const account = accounts.get(data.username);
    if (!account || account.password !== data.password)
      throw new ApiError("帳號或密碼不正確。示範模式請先註冊帳號。", 401);
    const { password, ...safe } = account;
    user = safe;
    return user;
  },
  async logout() {
    if (!isDemo) return request("/auth/logout", "POST");
    user = null;
  },
  async updateProfile(data) {
    if (!isDemo) return request("/auth/me", "PUT", data);
    if (!user) throw new ApiError("請先登入。", 401);
    const account = accounts.get(user.username);
    const fields = {};
    for (const [name, max] of [
      ["display_name", 50],
      ["contact", 100],
    ]) {
      if (name in data) {
        if (
          typeof data[name] !== "string" ||
          !data[name].trim() ||
          data[name].trim().length > max
        )
          throw new ApiError(
            `請填寫有效的${name === "contact" ? "聯絡方式" : "顯示名稱"}（最多 ${max} 字）。`,
            400,
          );
        fields[name] = data[name].trim();
      }
    }
    if ("new_password" in data) {
      if (typeof data.new_password !== "string" || data.new_password.length < 6)
        throw new ApiError("新密碼至少需要 6 個字元。", 400);
      if (data.current_password !== account.password)
        throw new ApiError("目前密碼不正確。", 400);
      fields.password = data.new_password;
    }
    if (!Object.keys(fields).length)
      throw new ApiError("沒有可修改的欄位。", 400);
    Object.assign(account, fields);
    const { password, ...safe } = account;
    user = safe;
    return user;
  },
  async list(filters) {
    if (!isDemo) return request(`/posts?${new URLSearchParams(filters)}`);
    let result = posts.filter(
      (p) =>
        (!filters.category || p.category === filters.category) &&
        (filters.status === "all" || p.status === filters.status) &&
        (!filters.mine || p.user_id === user?.id) &&
        (!filters.q ||
          `${p.title} ${p.description} ${p.found_location}`.includes(
            filters.q,
          )),
    );
    return {
      total: result.length,
      posts: result
        .sort((a, b) => b.found_at.localeCompare(a.found_at))
        .map(demoPost),
    };
  },
  async detail(id) {
    if (!isDemo) return request(`/posts/${id}`);
    const p = posts.find((p) => p.id === id);
    if (!p) throw new ApiError("找不到這筆資料。", 404);
    return { ...demoPost(p), is_owner: p.user_id === user?.id };
  },
  async save(data, id) {
    if (!isDemo)
      return request(id ? `/posts/${id}` : "/posts", id ? "PUT" : "POST", data);
    if (!user) throw new ApiError("請先登入。", 401);
    if (id) {
      const p = owned(id);
      if (data.status && data.status !== p.status) {
        p.returned_at =
          data.status === "returned" ? new Date().toISOString() : null;
      }
      Object.assign(p, data);
      return { ...demoPost(p), is_owner: true };
    }
    const p = {
      ...data,
      id: nextId++,
      user_id: user.id,
      author_name: user.display_name,
      author_username: user.username,
      contact: data.contact?.trim() || null,
      status: "open",
      returned_at: null,
    };
    posts.unshift(p);
    return { ...demoPost(p), is_owner: true };
  },
  async remove(id) {
    if (!isDemo) return request(`/posts/${id}`, "DELETE");
    owned(id);
    posts = posts.filter((p) => p.id !== id);
  },
  async upload(file) {
    if (!isDemo) {
      const form = new FormData();
      form.append("image", file);
      return request("/upload", "POST", form);
    }
    return {
      url: await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }),
    };
  },
};
