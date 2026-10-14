import { useEffect, useRef, useState, useId } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  MapPin,
  Clock3,
  X,
  Check,
  Upload,
  LogOut,
  SlidersHorizontal,
  RotateCcw,
  PackageOpen,
  BadgeCheck,
  KeyRound,
  CreditCard,
  Headphones,
  Wallet,
  Shirt,
  BookOpen,
  Umbrella,
  Shapes,
} from "lucide-react";
import { api, categories, isDemo } from "./api";
import ItemArt from "./ItemArt";
const icons = {
  id_card: CreditCard,
  electronics: Headphones,
  wallet: Wallet,
  key: KeyRound,
  clothing: Shirt,
  stationery: BookOpen,
  bottle_umbrella: Umbrella,
  other: Shapes,
};
const date = (value) =>
  new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={wide ? "modal wide" : "modal"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label="關閉" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Photo({ post }) {
  const [failed, setFailed] = useState(false);
  return post.image_url && !failed ? (
    <img
      src={post.image_url}
      alt={post.title}
      onError={() => setFailed(true)}
    />
  ) : post.art ? (
    <ItemArt kind={post.art} />
  ) : (
    <div className="no-photo">
      <PackageOpen size={38} />
      <span>尚未提供照片</span>
    </div>
  );
}
function Auth({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSuccess(
        await api.auth(mode, Object.fromEntries(new FormData(e.currentTarget))),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={mode === "login" ? "歡迎回來。" : "一起讓失物回家。"}
      onClose={onClose}
    >
      <p className="muted">瀏覽失物不需要帳號。登入後即可刊登拾獲物品。</p>
      <div className="auth-tabs">
        <button
          className={mode === "login" ? "selected" : ""}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          登入
        </button>
        <button
          className={mode === "register" ? "selected" : ""}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          註冊帳號
        </button>
      </div>
      <form onSubmit={submit}>
        <label>
          帳號
          <input
            name="username"
            autoComplete="username"
            required
            pattern="[A-Za-z0-9]{3,20}"
            title="3–20 個英文字母或數字"
            placeholder="學號或 3–20 個英數字"
          />
        </label>
        <label>
          密碼
          <input
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            placeholder="至少 6 個字元"
          />
        </label>
        {mode === "register" && (
          <>
            <label>
              顯示名稱
              <input
                name="display_name"
                required
                placeholder="想讓大家怎麼稱呼你？"
              />
            </label>
            <label>
              聯絡方式
              <input
                name="contact"
                required
                placeholder="例如 Email 或 LINE ID"
              />
            </label>
            <p className="small muted">
              刊登物品時，聯絡方式會公開給訪客查看。
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? "處理中…" : mode === "login" ? "登入" : "註冊並登入"}
        </button>
        {isDemo && (
          <p className="demo-hint">
            目前為示範模式，請使用虛構資料註冊；重新整理後資料會重置。
          </p>
        )}
      </form>
    </Modal>
  );
}
function Editor({ post, user, onClose, onSaved }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(post?.image_url || "");
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    delete data.image;
    try {
      if (file) data.image_url = (await api.upload(file)).url;
      else if (post) data.image_url = preview || null;
      data.found_at =
        data.found_at.length === 16 ? `${data.found_at}:00` : data.found_at;
      onSaved(await api.save(data, post?.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal wide title={post ? "編輯刊登" : "你撿到了什麼？"} onClose={onClose}>
      <p className="muted">多一點線索，就多一個找回的機會。標示 * 為必填。</p>
      <form onSubmit={submit}>
        <label className="upload-box">
          {preview ? (
            <img src={preview} alt="上傳照片預覽" />
          ) : (
            <>
              <Upload size={27} />
              <strong>選擇物品照片</strong>
              <span>JPG、PNG、WebP，最大 5 MB（選填）</span>
            </>
          )}
          <input
            aria-label="物品照片"
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;
              if (
                f.size > 5 * 1024 * 1024 ||
                !["image/jpeg", "image/png", "image/webp"].includes(f.type)
              ) {
                setError("請選擇 5 MB 以內的 JPG、PNG 或 WebP 照片。");
                e.target.value = "";
                return;
              }
              setError("");
              setFile(f);
            }}
          />
        </label>
        {preview && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFile(null);
              setPreview("");
            }}
          >
            移除照片
          </button>
        )}
        <div className="form-grid">
          <label>
            物品名稱 *
            <input
              name="title"
              defaultValue={post?.title}
              required
              maxLength={100}
              placeholder="例如：藍色保溫水壺"
            />
          </label>
          <label>
            物品分類 *
            <select
              name="category"
              defaultValue={post?.category || ""}
              required
            >
              <option value="" disabled>
                選擇分類
              </option>
              {Object.entries(categories).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            拾獲地點 *
            <input
              name="found_location"
              defaultValue={post?.found_location}
              required
              placeholder="例如：圖書館 2 樓自習區"
            />
          </label>
          <label>
            拾獲時間 *
            <input
              type="datetime-local"
              name="found_at"
              required
              defaultValue={post?.found_at?.slice(0, 16)}
            />
          </label>
        </div>
        <label>
          外觀與特徵
          <textarea
            name="description"
            defaultValue={post?.description}
            rows={3}
            placeholder="顏色、品牌、特別的吊飾…留下一些線索。"
          />
        </label>
        <div className="form-grid">
          <label>
            目前保管地點
            <input
              name="storage_location"
              defaultValue={post?.storage_location}
              placeholder="例如：圖書館櫃檯"
            />
          </label>
          <label>
            聯絡方式
            <input
              name="contact"
              defaultValue={post?.contact || user.contact}
              placeholder="未填則使用帳號聯絡方式"
            />
          </label>
        </div>
        <p className="small muted">
          聯絡方式將公開。請避免拍攝完整證件號碼或其他個人資料。
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? "正在儲存…" : post ? "儲存變更" : "刊登拾獲物品"}
        </button>
      </form>
    </Modal>
  );
}
export default function App() {
  const [user, setUser] = useState(null),
    [items, setItems] = useState([]),
    [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState("open"),
    [mine, setMine] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [modal, setModal] = useState(null),
    [detail, setDetail] = useState(null),
    [detailLoading, setDetailLoading] = useState(false),
    [detailError, setDetailError] = useState(""),
    [notice, setNotice] = useState(""),
    [version, setVersion] = useState(0),
    [busy, setBusy] = useState(false),
    [deleteConfirm, setDeleteConfirm] = useState(false);
  const pendingCreate = useRef(false);
  const detailRequest = useRef(0);
  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch((e) => {
        if (e.status !== 401) setNotice(e.message);
      });
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .list({ q: search, category, status, ...(mine ? { mine: "1" } : {}) })
      .then((r) => {
        if (!cancelled) setItems(r.posts);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, status, mine, version]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  async function openDetail(id) {
    const request = ++detailRequest.current;
    setModal("detail");
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setDeleteConfirm(false);
    try {
      const post = await api.detail(id);
      if (request === detailRequest.current) setDetail(post);
    } catch (e) {
      if (request === detailRequest.current) setDetailError(e.message);
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  }
  const create = () => {
    pendingCreate.current = true;
    setModal(user ? "editor" : "auth");
  };
  const close = () => {
    detailRequest.current++;
    setModal(null);
    pendingCreate.current = false;
  };
  async function ownerAction(remove = false) {
    setBusy(true);
    setDetailError("");
    try {
      if (remove) {
        await api.remove(detail.id);
        close();
        setNotice("刊登已刪除。");
      } else {
        setDetail(
          await api.save(
            { status: detail.status === "open" ? "returned" : "open" },
            detail.id,
          ),
        );
        setNotice("物品狀態已更新。");
      }
      setVersion((v) => v + 1);
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="header">
        <a
          className="brand"
          href="#"
          onClick={() => {
            setMine(false);
            setCategory("");
            setStatus("open");
            setQuery("");
            setSearch("");
          }}
        >
          <span className="brand-mark">
            <Search size={24} />
            <i />
          </span>
          <span>
            iforgotthings<span className="brand-sub">中央大學失物招領</span>
          </span>
        </a>
        <nav aria-label="主導覽">
          <button
            className={!mine ? "nav-active" : ""}
            onClick={() => {
              setMine(false);
              document
                .getElementById("board")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            找找失物
          </button>
          {user && (
            <button
              className={mine ? "nav-active" : ""}
              onClick={() => {
                setMine(true);
                setStatus("all");
              }}
            >
              我的刊登
            </button>
          )}
          <button onClick={() => setModal("guide")}>認領指南</button>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="username">{user.display_name}</span>
              <button
                className="icon-button"
                aria-label="登出"
                onClick={async () => {
                  try {
                    await api.logout();
                    setUser(null);
                    setMine(false);
                    setNotice("已登出。");
                  } catch (e) {
                    setNotice(e.message);
                  }
                }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              className="login"
              onClick={() => {
                pendingCreate.current = false;
                setModal("auth");
              }}
            >
              登入 / 註冊
            </button>
          )}
          <button className="primary" onClick={create}>
            <Plus size={18} />
            我撿到東西了
          </button>
        </div>
      </header>
      <div className="mobile-nav">
        <button
          onClick={() => {
            setMine(false);
            setStatus("open");
          }}
        >
          找找失物
        </button>
        {user && (
          <button
            onClick={() => {
              setMine(true);
              setStatus("all");
            }}
          >
            我的刊登
          </button>
        )}
        <button onClick={() => setModal("guide")}>認領指南</button>
      </div>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="campus">
              <span />
              在中央，幫彼此留意一下。
            </div>
            <h1>
              忘了帶走，
              <br />
              還好有人拾起。
            </h1>
            <p>
              水壺、鑰匙，或是陪你熬夜的耳機。
              <br />
              你在找的，也許正在這裡等你。
            </p>
            <a href="#board" className="hero-link">
              找找我的東西 <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit" />
            <div className="note note-back">
              <span>拾獲地點</span>
              <strong>
                中央大學
                <br />
                某個你經過的地方
              </strong>
              <div className="note-lines" />
            </div>
            <div className="note note-front">
              <div className="tape" />
              <div className="note-top">
                <span>尋找主人中</span>
                <span>☺</span>
              </div>
              <ItemArt kind="keys" />
              <div className="note-caption">
                是不是你的？<span>Lost & found, in NCU.</span>
              </div>
            </div>
            <span className="handwriting">
              讓日常的小遺憾，
              <br />
              有個好結尾。
            </span>
            <span className="spark">✳</span>
          </div>
        </section>
        <section id="board" className="board">
          <div className="board-heading">
            <div>
              <h2>
                {mine ? "我的刊登" : "失物招領板"}
                <span className="heading-dot" />
              </h2>
              <p>
                {mine
                  ? "管理你留下的線索，記錄每一次歸還。"
                  : "從這裡，找回你的小日常。"}
              </p>
            </div>
            <span className="public-note">
              <BadgeCheck size={16} />
              不用登入，也能查看與聯絡
            </span>
          </div>
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(query.trim());
            }}
          >
            <Search size={22} />
            <input
              aria-label="搜尋失物"
              placeholder="試試物品名稱、特徵或拾獲地點…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="icon-button"
                aria-label="清除搜尋"
                onClick={() => {
                  setQuery("");
                  setSearch("");
                }}
              >
                <X size={18} />
              </button>
            )}
            <button className="primary" type="submit">
              搜尋失物
            </button>
          </form>
          <div className="categories" aria-label="物品分類">
            <button
              className={!category ? "active" : ""}
              onClick={() => setCategory("")}
            >
              <Shapes size={17} />
              全部物品
            </button>
            {Object.entries(categories).map(([key, label]) => {
              const Icon = icons[key];
              return (
                <button
                  key={key}
                  className={category === key ? "active" : ""}
                  onClick={() => setCategory(key)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="list-toolbar">
            <div className="status-tabs">
              <button
                className={status === "open" ? "active" : ""}
                onClick={() => setStatus("open")}
              >
                待認領
              </button>
              <button
                className={status === "returned" ? "active" : ""}
                onClick={() => setStatus("returned")}
              >
                已歸還
              </button>
              <button
                className={status === "all" ? "active" : ""}
                onClick={() => setStatus("all")}
              >
                全部
              </button>
            </div>
            <span className="result-count">
              {loading ? "載入中…" : `${items.length} 件物品`}
              <span className="sort-label">
                <SlidersHorizontal size={14} />
                依拾獲時間排序
              </span>
            </span>
          </div>
          {isDemo && (
            <div className="demo-banner">
              <span>示範預覽</span>
              以下為虛構物品與插畫；刊登與帳號資料僅保留於本次瀏覽。
            </div>
          )}
          {error ? (
            <div className="empty">
              <PackageOpen size={38} />
              <h3>暫時無法載入失物</h3>
              <p role="alert">{error}</p>
              <button
                className="secondary"
                onClick={() => setVersion((v) => v + 1)}
              >
                <RotateCcw size={16} />
                重新載入
              </button>
            </div>
          ) : loading ? (
            <div className="item-grid" aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : items.length ? (
            <div className="item-grid">
              {items.map((post) => (
                <button
                  className="item-card"
                  aria-label={`查看 ${post.title}`}
                  key={post.id}
                  onClick={() => openDetail(post.id)}
                >
                  <div className={`item-image tone-${post.category}`}>
                    <Photo post={post} />
                    <span
                      className={`badge ${post.status === "returned" ? "returned" : ""}`}
                    >
                      {post.status === "returned" ? (
                        <Check size={12} />
                      ) : (
                        <span />
                      )}
                      {post.status === "returned" ? "已歸還" : "待認領"}
                    </span>
                  </div>
                  <div className="item-body">
                    <span className="category-label">
                      {categories[post.category]}
                    </span>
                    <h3>{post.title}</h3>
                    <p>
                      <MapPin size={14} />
                      {post.found_location}
                    </p>
                    <div className="item-bottom">
                      <span>
                        <Clock3 size={13} />
                        {date(post.found_at)}
                      </span>
                      <ArrowUpRight size={19} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={36} />
              <h3>還沒有找到符合的物品</h3>
              <p>換個關鍵字或分類，再找找看。</p>
              <button
                className="secondary"
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setCategory("");
                  setStatus("all");
                }}
              >
                清除篩選條件
              </button>
            </div>
          )}
          <div className="kindness">
            <div className="kindness-icon">
              <PackageOpen size={29} />
            </div>
            <div>
              <h3>剛好撿到別人的小日常？</h3>
              <p>拍張照、留下地點，讓正在著急的人安心一點。</p>
            </div>
            <button onClick={create}>
              刊登拾獲物品
              <ArrowUpRight size={19} />
            </button>
          </div>
        </section>
      </main>
      <footer>
        <a className="footer-brand" href="#">
          iforgotthings <span>in NCU</span>
        </a>
        <span>讓遺失的東西，回到熟悉的人身邊。</span>
        <span>國立中央大學 · 校園失物招領</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="關閉通知"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal === "auth" && (
        <Auth
          onClose={close}
          onSuccess={(u) => {
            setUser(u);
            setModal(pendingCreate.current ? "editor" : null);
            setNotice("登入成功。");
          }}
        />
      )}
      {(modal === "editor" || modal === "edit") && (
        <Editor
          user={user}
          post={modal === "edit" ? detail : null}
          onClose={close}
          onSaved={(p) => {
            setVersion((v) => v + 1);
            setDetail(p);
            setModal("detail");
            setDetailError("");
            setNotice("刊登已儲存。");
          }}
        />
      )}
      {modal === "detail" && (
        <Modal wide title="物品詳細資訊" onClose={close}>
          {detailLoading ? (
            <p className="empty">正在尋找物品資訊…</p>
          ) : (
            detail && (
              <>
                <div className="detail-layout">
                  <div className={`detail-image tone-${detail.category}`}>
                    <Photo post={detail} />
                  </div>
                  <div>
                    <span className="category-label">
                      {categories[detail.category]} /{" "}
                      {detail.status === "open" ? "待認領" : "已歸還"}
                    </span>
                    <h2 className="detail-title">{detail.title}</h2>
                    <p className="description">
                      {detail.description || "拾獲者尚未補充物品特徵。"}
                    </p>
                    <dl>
                      <dt>拾獲地點</dt>
                      <dd>{detail.found_location}</dd>
                      <dt>拾獲時間</dt>
                      <dd>{date(detail.found_at)}</dd>
                      <dt>保管地點</dt>
                      <dd>{detail.storage_location || "請聯絡拾獲者確認"}</dd>
                      <dt>拾獲者</dt>
                      <dd>{detail.author_name}</dd>
                    </dl>
                  </div>
                </div>
                <div className="contact-box">
                  <span>這是你的物品嗎？</span>
                  <h3>
                    {detail.status === "returned"
                      ? "這件物品已歸還"
                      : "聯絡拾獲者，確認認領方式"}
                  </h3>
                  <p>{detail.contact}</p>
                  <small>請描述物品特徵，協助拾獲者確認你是主人。</small>
                </div>
                {detail.is_owner && (
                  <div className="owner-actions">
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => setModal("edit")}
                    >
                      編輯刊登
                    </button>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => ownerAction()}
                    >
                      {detail.status === "open" ? "標記已歸還" : "重新開放認領"}
                    </button>
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => setDeleteConfirm(true)}
                    >
                      刪除
                    </button>
                  </div>
                )}
                {deleteConfirm && (
                  <div className="delete-confirm">
                    <p>確定要刪除這篇刊登嗎？刪除後無法復原。</p>
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => ownerAction(true)}
                    >
                      確定刪除
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setDeleteConfirm(false)}
                    >
                      取消
                    </button>
                  </div>
                )}
              </>
            )
          )}
          {detailError && (
            <p className="error" role="alert">
              {detailError}
            </p>
          )}
        </Modal>
      )}
      {modal === "guide" && (
        <Modal title="認領指南" onClose={close}>
          <div className="guide-step">
            <Search />
            <div>
              <h3>先找找看</h3>
              <p>用物品名稱、分類或拾獲地點尋找失物，不用登入。</p>
            </div>
          </div>
          <div className="guide-step">
            <MapPin />
            <div>
              <h3>確認是你的物品</h3>
              <p>點開物品查看照片、拾獲時間與地點，核對外觀特徵。</p>
            </div>
          </div>
          <div className="guide-step">
            <BadgeCheck />
            <div>
              <h3>聯絡拾獲者</h3>
              <p>
                使用刊登中的聯絡方式，描述物品特徵並約定認領方式。領取後，請拾獲者將物品標記為已歸還。
              </p>
            </div>
          </div>
          <button className="primary full" onClick={close}>
            開始找找
          </button>
        </Modal>
      )}
    </>
  );
}
