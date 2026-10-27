import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Play,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";

const utilityItems = [
  "商品链接匹配图片",
  "货号匹配本地图片",
  "补全商品信息",
  "文件操作",
  "PPT检测",
  "竞店数据解密",
  "下载商品图片",
];

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const previewAsset = (path) => {
  if (path.startsWith("data:")) return path;
  return globalThis.__FRAME_PREVIEW_ASSETS__?.[path] ?? assetPath(path);
};

// Keep only the first ten rows for this design prototype.
const groups = [
  {
    store: "Mizuno美津浓官方旗舰店",
    line: "路飞运营线",
    total: 100,
    complete: 198,
    types: [
      ["产品种草", 0, "九灵", 67, 191, 191, 191, 191, "285.07%"],
      ["创意种草", 0, "九灵", 3, 5, 5, 5, 5, "166.67%"],
      ["AI种草", 0, "九灵", 5, 1, 1, 0, 1, "20%"],
      ["引流转化", 0, "九灵", 15, 1, 1, 1, 1, "6.67%"],
      ["达人/品牌二剪", 0, "九灵", 10, 0, 0, 0, 0, "0%"],
    ],
  },
  {
    store: "Mizuno美津浓轻运动旗舰店",
    line: "路飞运营线",
    total: 70,
    complete: 166,
    types: [
      ["产品种草", 0, "九灵", 45, 166, 166, 166, 166, "368.89%"],
      ["AI种草", 0, "九灵", 4, 0, 0, 0, 0, "0%"],
      ["达人/品牌二剪", 0, "九灵", 6, 0, 0, 0, 0, "0%"],
      ["引流转化", 0, "九灵", 12, 0, 0, 0, 0, "0%"],
      ["创意种草", 0, "九灵", 3, 0, 0, 0, 0, "0%"],
    ],
  },
];

const headers = ["任务信息", "成片视频", "商品", "抽帧产出图", "生成任务链接"];

function formatTaskNumber(createdOn, taskSequence, outputGroup = 1) {
  return `${createdOn.replaceAll("-", "").slice(2)}${String(taskSequence).padStart(2, "0")}${String(outputGroup).padStart(2, "0")}`;
}

// Sample creation order spans stores and is assigned before filtering.
// Production task numbers should be supplied by the platform's daily allocator.
const sampleTasks = groups.flatMap((g, groupIndex) => g.types.map((row, rowIndex) => {
  const taskId = `${groupIndex + 1}-${rowIndex + 1}`;
  return { g, row, taskLinks: {
    frame: `https://example.com/?task=frame-${taskId}`,
    storyboard: `https://example.com/?task=storyboard-${taskId}`,
    video: `https://example.com/?task=video-${taskId}`,
  } };
})).map((task, index) => ({
  ...task,
  taskNumber: formatTaskNumber("2026-09-08", Math.floor(index / 5) + 1, (index % 5) + 1),
  generationTaskId: String(501 + index).padStart(3, "0"),
  productId: String(927104680001 + index),
}));

const productOptions = sampleTasks.map(({ productId, g, row }, index) => ({
  id: productId,
  name: `${g.store} · ${row[0]}`,
  store: g.store,
  type: row[0],
  thumbnail: previewAsset(`/assets/frame-thumbnails/frame-${String((index % 9) + 1).padStart(2, "0")}.jpg`),
}));

function ProductSummary({ productId }) {
  const product = productOptions.find((item) => item.id === productId);
  if (!product) return <span>{productId}</span>;

  return <div className="table-product">
    <img className="table-product-thumbnail" src={product.thumbnail} alt={`${product.name}商品图`} width="56" height="56" />
    <div className="table-product-info">
      <strong className="table-product-id">{product.id}</strong>
      <span className="table-product-store">{product.store}</span>
      <span className="table-product-type">{product.type}</span>
    </div>
  </div>;
}

// Fixed shuffled order keeps the schematic varied without reordering on every render.
const frameThumbnails = [3, 8, 1, 6, 4, 9, 2, 7, 5].map((number) => previewAsset(`/assets/frame-thumbnails/frame-${String(number).padStart(2, "0")}.jpg`));
const storyboardThumbnails = Array.from({ length: 9 }, (_, i) => previewAsset(`/assets/storyboard-thumbnails/storyboard-${String(i + 1).padStart(2, "0")}.jpg`));
const storyboardVideos = Array.from({ length: 9 }, (_, i) => {
  const id = String(i + 1).padStart(2, "0");
  return { src: previewAsset(`/assets/storyboard-videos/video-${id}.mp4`), poster: previewAsset(`/assets/storyboard-videos/video-${id}.jpg`), title: `示例视频 ${id}`, duration: "0:04" };
});

function FinishedVideo({ generationTaskId, onPlay }) {
  const video = storyboardVideos[(Number(generationTaskId) - 501) % storyboardVideos.length];
  return <button className="video-thumbnail finished-video" type="button" aria-label={`播放成片视频，生成任务 ${generationTaskId}`} onClick={() => onPlay({ ...video, label: "成片视频" })}>
    <img src={video.poster} alt={`生成任务 ${generationTaskId} 的示例成片封面`} width="160" height="90" />
    <span className="video-play-icon" aria-hidden="true"><Play size={15} fill="currentColor" /></span>
    <span className="finished-video-label">示例成片</span>
    <span className="video-duration">{video.duration}</span>
  </button>;
}

function TaskLink({ href, label }) {
  return <a className="task-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}，示例任务网页（新标签页打开）`} title="示例任务网页（新标签页打开）">{href}</a>;
}

function ThumbnailGrid({ label, images, count }) {
  return <div className="frame-thumbnail-scroll" role="group" aria-label={`${label}，示例缩略图，可滚动查看`}>
    <div className="frame-thumbnail-grid">
      {images.map((src, index) => <img key={src} src={src} alt={`${label}，示例图片 ${index + 1}`} width="240" height="180" decoding="async" />)}
    </div>
    {count !== undefined && <span className="thumbnail-count-badge" aria-label={`共 ${count} 张`}>{count} 张</span>}
  </div>;
}

function VideoGrid({ label, onPlay }) {
  return <div className="video-thumbnail-grid" role="group" aria-label={`${label}，9 个示例视频`}>
    {storyboardVideos.map((video) => <button key={video.src} className="video-thumbnail" type="button" aria-label={`播放${label}，${video.title}`} onClick={() => onPlay({ ...video, label })}>
      <img src={video.poster} alt="" width="320" height="240" loading="lazy" decoding="async" />
      <span className="video-play-icon" aria-hidden="true"><Play size={13} fill="currentColor" /></span>
      <span className="video-duration" aria-hidden="true">{video.duration}</span>
    </button>)}
  </div>;
}

function VideoPreview({ video, onClose }) {
  const dialogRef = useRef(null);
  const playerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
    const player = playerRef.current;
    player.play().catch(() => {});
    return () => player?.pause();
  }, []);

  return <dialog ref={dialogRef} className="video-preview" aria-labelledby="video-preview-title" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close(); }}>
    <div className="video-preview-header">
      <h2 id="video-preview-title">{video.label} · {video.title}</h2>
      <button type="button" className="video-preview-close" aria-label="关闭视频预览" onClick={() => dialogRef.current.close()}><X size={20} /></button>
    </div>
    <video ref={playerRef} src={video.src} poster={video.poster} aria-label={`${video.label}，${video.title}`} controls autoPlay muted playsInline onError={() => setFailed(true)} />
    {failed && <p className="video-error" role="alert">视频暂时无法播放，请关闭后重试。</p>}
  </dialog>;
}

function MaterialThumb({ file, onPreview }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const isVideo = file.type.startsWith("video/");

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return <button className="material-thumb" type="button" onClick={() => onPreview(file)} aria-label={`预览素材 ${file.name}`}>
    {isVideo
      ? <video src={url} muted playsInline preload="metadata" />
      : <img src={url} alt="" />}
    <span className="material-thumb-shade" />
    {isVideo && <span className="material-thumb-play"><Play size={17} fill="currentColor" /></span>}
    <span className="material-thumb-name">{file.name}</span>
  </button>;
}

function MaterialPreview({ file, onClose }) {
  const dialogRef = useRef(null);
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const isVideo = file.type.startsWith("video/");

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return <dialog ref={dialogRef} className="material-preview" aria-labelledby="material-preview-title" onClose={onClose}>
    <div className="material-preview-header">
      <h3 id="material-preview-title">{file.name}</h3>
      <button type="button" className="dialog-close" aria-label="关闭素材预览" onClick={() => dialogRef.current.close()}><X size={19} /></button>
    </div>
    <div className="material-preview-stage">
      {isVideo ? <video src={url} controls autoPlay playsInline /> : <img src={url} alt={file.name} />}
    </div>
  </dialog>;
}

function CreateTaskDialog({ files, onFilesChange, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const selectedProduct = productOptions.find((product) => product.id === selectedProductId);
  const matchedProducts = useMemo(() => productQuery
    ? productOptions.filter((product) => product.id.includes(productQuery)).slice(0, 5)
    : [], [productQuery]);

  function selectProduct(product) {
    setSelectedProductId(product.id);
    setProductQuery("");
  }

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
  }, []);

  return <dialog ref={dialogRef} className="create-task-dialog" aria-labelledby="create-task-title" onClose={onCancel}>
    <div className="create-task-header">
      <div>
        <h2 id="create-task-title">创建任务</h2>
        <p>上传素材后创建一条新的智能抽帧任务</p>
      </div>
      <button type="button" className="dialog-close" aria-label="关闭创建任务" onClick={() => dialogRef.current.close()}><X size={19} /></button>
    </div>
    <div className="create-task-body">
      <div className="product-lookup">
        <div className="product-lookup-label"><strong>关联商品 ID</strong><span>必选 · 单选</span></div>
        <>
          <div className="product-search-control">
            <Search size={17} />
            <input
              value={productQuery}
              inputMode="numeric"
              placeholder={selectedProduct ? "输入新的商品 ID，选择后将替换当前关联" : "请输入商品 ID 进行检索"}
              aria-label="检索商品 ID"
              onChange={(event) => setProductQuery(event.target.value.replace(/\D/g, ""))}
              onKeyDown={(event) => { if (event.key === "Enter" && matchedProducts.length) { event.preventDefault(); selectProduct(matchedProducts[0]); } }}
            />
            <button type="button" onClick={() => { if (matchedProducts.length) selectProduct(matchedProducts[0]); }}>检索</button>
          </div>
          {productQuery && <div className="product-results">
            {matchedProducts.length ? matchedProducts.map((product) => <button key={product.id} type="button" onClick={() => selectProduct(product)}>
              <img src={product.thumbnail} alt="" />
              <span className="product-result-copy"><strong>{product.id}</strong><small>{product.name}</small></span>
            </button>) : <p>未找到对应商品，请检查商品 ID</p>}
          </div>}
        </>
        {selectedProduct && <div className="selected-product-card">
          <img src={selectedProduct.thumbnail} alt="" />
          <span className="product-result-copy"><em>已关联</em><strong>{selectedProduct.id}</strong><small>{selectedProduct.name}</small></span>
        </div>}
      </div>
      <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*,video/*" multiple onChange={(event) => { const picked = Array.from(event.target.files ?? []); if (picked.length) onFilesChange([...files, ...picked]); event.target.value = ""; }} />
      {files.length === 0 ? <div className="material-upload-card">
          <span className="upload-icon"><Upload size={23} /></span>
          <strong>请选择任务素材</strong>
          <span>支持图片和视频，可一次选择多个文件</span>
          <button className="btn" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> 上传素材</button>
        </div>
        : <div className="task-folder-view">
          <div className="task-folder-meta"><strong>任务素材</strong><span>共 {files.length} 个文件，点击缩略图可打开预览</span></div>
          <div className="material-grid" aria-label="任务素材缩略图">
            {files.map((file, index) => <MaterialThumb key={`${file.name}-${file.size}-${index}`} file={file} onPreview={setPreviewFile} />)}
            <button className="material-add" type="button" onClick={() => fileInputRef.current?.click()} aria-label="继续上传素材">
              <span><Plus size={24} /></span>
              <strong>继续上传</strong>
            </button>
          </div>
        </div>}
    </div>
    <div className="create-task-footer">
      <button className="btn" type="button" onClick={() => dialogRef.current.close()}>取消</button>
      <button className="btn primary" type="button" disabled={!files.length || !selectedProductId} onClick={() => onConfirm(selectedProductId)}>确认创建并启动任务</button>
    </div>
    {previewFile && <MaterialPreview file={previewFile} onClose={() => setPreviewFile(null)} />}
  </dialog>;
}

function AdvancedSettingsDialog({ onClose, onSave }) {
  const dialogRef = useRef(null);
  const [strategy, setStrategy] = useState("智能采样");
  const [interval, setInterval] = useState("2");
  const [maxFrames, setMaxFrames] = useState("9");
  const [quality, setQuality] = useState("标准");

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
  }, []);

  function save() {
    onSave({ strategy, interval, maxFrames, quality });
    dialogRef.current.close();
  }

  return <dialog ref={dialogRef} className="advanced-settings-dialog" aria-labelledby="advanced-settings-title" onClose={onClose}>
    <div className="advanced-settings-header">
      <div><h2 id="advanced-settings-title">高级设置</h2><p>配置智能抽帧策略和输出参数</p></div>
      <button type="button" className="dialog-close" aria-label="关闭高级设置" onClick={() => dialogRef.current.close()}><X size={19} /></button>
    </div>
    <div className="advanced-settings-body">
      <div className="settings-section"><h3>抽帧策略</h3><div className="strategy-options">
        {["智能采样", "固定间隔", "关键帧优先"].map((item) => <label key={item} className={`strategy-option ${strategy === item ? "selected" : ""}`}><input type="radio" name="frame-strategy" value={item} checked={strategy === item} onChange={(e) => setStrategy(e.target.value)} /><span><strong>{item}</strong><small>{item === "智能采样" ? "自动识别画面变化并选取代表帧" : item === "固定间隔" ? "按指定时间间隔均匀抽取" : "优先保留视频中的关键变化画面"}</small></span></label>)}
      </div></div>
      <div className="settings-section"><h3>输出参数</h3><div className="settings-grid">
        <label><span>抽帧间隔（秒）</span><input type="number" min="0.5" step="0.5" value={interval} onChange={(e) => setInterval(e.target.value)} /></label>
        <label><span>每个视频最多抽取</span><input type="number" min="1" max="99" value={maxFrames} onChange={(e) => setMaxFrames(e.target.value)} /></label>
        <label><span>图片质量</span><select value={quality} onChange={(e) => setQuality(e.target.value)}><option>标准</option><option>高清</option><option>原图</option></select></label>
      </div></div>
    </div>
    <div className="advanced-settings-footer"><button className="btn" type="button" onClick={() => dialogRef.current.close()}>取消</button><button className="btn primary" type="button" onClick={save}>保存设置</button></div>
  </dialog>;
}

function App() {
  const [activeTool] = useState("智能抽帧生成任务");
  const [utilityOpen, setUtilityOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [month, setMonth] = useState("2026-09");
  const [monthOpen, setMonthOpen] = useState(false);
  const [group, setGroup] = useState("");
  const [line, setLine] = useState("");
  const [store, setStore] = useState("");
  const [productId, setProductId] = useState("");
  const [generationTaskId, setGenerationTaskId] = useState("");
  const [query, setQuery] = useState({ month: "2026-09", group: "", line: "", store: "", productId: "", generationTaskId: "" });
  const [notice, setNotice] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [taskFiles, setTaskFiles] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [expandedBatches, setExpandedBatches] = useState([]);
  const sideNavScrollRef = useRef(null);

  const lines = [...new Set(groups.map((g) => g.line))];
  const stores = [...new Set(groups.map((g) => g.store))];
  const members = [...new Set(groups.flatMap((g) => g.types.map((r) => r[2])))];

  const filteredGroups = useMemo(() => groups.filter((g) => {
    const lineOk = !query.line || g.line === query.line;
    const storeOk = !query.store || g.store === query.store;
    const groupOk = !query.group || g.types.some((r) => r[2] === query.group);
    return lineOk && storeOk && groupOk;
  }), [query]);

  const filteredSampleTasks = useMemo(() => sampleTasks.filter(({ g, productId: id, generationTaskId: taskId }) => {
    if (!filteredGroups.includes(g)) return false;
    return (!query.productId || id.includes(query.productId)) && (!query.generationTaskId || taskId.toLowerCase().includes(query.generationTaskId.toLowerCase()));
  }), [filteredGroups, query.productId, query.generationTaskId]);
  const filteredCreatedTasks = useMemo(() => createdTasks.filter(({ g, productId: id, generationTaskId: taskId }) => {
    const lineOk = !query.line || g.line === query.line;
    const storeOk = !query.store || g.store === query.store;
    return lineOk && storeOk && (!query.productId || String(id).includes(query.productId)) && (!query.generationTaskId || taskId.toLowerCase().includes(query.generationTaskId.toLowerCase()));
  }), [createdTasks, query]);
  const flatRows = useMemo(() => [...filteredCreatedTasks, ...filteredSampleTasks].slice(0, 10), [filteredCreatedTasks, filteredSampleTasks]);
  const visibleRows = useMemo(() => {
    const batches = new Map();
    for (const task of flatRows) {
      const batchId = task.taskNumber.slice(0, -2);
      if (!batches.has(batchId)) batches.set(batchId, []);
      batches.get(batchId).push(task);
    }
    return [...batches].flatMap(([batchId, tasks]) => {
      const expanded = expandedBatches.includes(batchId);
      return (expanded ? tasks : tasks.slice(0, 1)).map((task, index) => ({
        ...task,
        batchId,
        batchSize: tasks.length,
        isBatchFirst: index === 0,
        expanded,
      }));
    });
  }, [flatRows, expandedBatches]);

  function toggleBatch(batchId) {
    setExpandedBatches((current) => current.includes(batchId)
      ? current.filter((id) => id !== batchId)
      : [...current, batchId]);
  }

  useEffect(() => {
    if (aiOpen && sideNavScrollRef.current) {
      sideNavScrollRef.current.scrollTop = sideNavScrollRef.current.scrollHeight;
    }
  }, [aiOpen]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery({ month, group, line, store, productId, generationTaskId });
    setExpandedBatches([]);
    setNotice("筛选条件已应用");
    window.setTimeout(() => setNotice(""), 1800);
  }

  function closeCreateTask() {
    setCreateTaskOpen(false);
    setTaskFiles([]);
  }

  function saveAdvancedSettings(settings) {
    setAdvancedSettingsOpen(false);
    setNotice(`高级设置已保存：${settings.strategy}`);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function handleCreateTask(productId) {
    if (!taskFiles.length) return;
    const now = new Date();
    const createdOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const selectedGroup = groups.find((item) => item.store === store) ?? groups[0];
    const dailySequence = createdTasks.length + 1;
    const taskNumber = formatTaskNumber(createdOn, dailySequence, 1);
    const generationTaskId = String(511 + createdTasks.length).padStart(3, "0");
    setCreatedTasks((current) => [{
      g: { ...selectedGroup, total: 0, complete: 0 },
      row: ["新建任务", 0, group || "九灵", 0, 0, 0, 0, 0, "0%"],
      taskLinks: { frame: "", storyboard: "", video: "" },
      taskNumber,
      generationTaskId,
      productId,
      isNew: true,
      fileCount: taskFiles.length,
    }, ...current]);
    setCreateTaskOpen(false);
    setTaskFiles([]);
    setNotice(`任务 ${taskNumber} 创建成功`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function handleToolClick(item) {
    if (item === activeTool) return;
    setNotice(`${item}为导航示意，当前仍展示智能抽帧任务历史`);
    window.setTimeout(() => setNotice(""), 1800);
  }

  return (
    <div className="app-shell" style={{ backgroundImage: `url(${previewAsset("/assets/qifei-background.png")})` }}>
      <header className="qifei-topbar">
        <div className="qifei-brand"><img src={previewAsset("/assets/qifei-logo.png")} alt="祈飞小工具" /></div>
        <div className="shop-switcher">
          <strong>APEE官方旗舰店</strong>
          <button type="button" onClick={() => { setNotice("切换店铺为原型示意"); window.setTimeout(() => setNotice(""), 1800); }}>切换店铺</button>
        </div>
        <button className="user-menu" type="button" aria-label="用户菜单" onClick={() => { setNotice("用户菜单为原型示意"); window.setTimeout(() => setNotice(""), 1800); }}>
          <img src={previewAsset("/assets/kml_avator.png")} alt="" /><span>明昧</span><ChevronDown size={12} strokeWidth={2.2} />
        </button>
      </header>
      <div className="qifei-layout">
        <aside className="side-navigation" aria-label="工具导航">
          <div className="side-nav-scroll" ref={sideNavScrollRef}>
            <section className="tool-group">
              <button className="tool-group-title" type="button" aria-expanded={utilityOpen} onClick={() => setUtilityOpen((value) => !value)}>
                <span>实用工具</span><ChevronDown className={utilityOpen ? "open" : ""} size={13} />
              </button>
              {utilityOpen && <nav className="tool-list" aria-label="实用工具">
                {utilityItems.map((item) => <button key={item} type="button" className={activeTool === item ? "active" : ""} aria-current={activeTool === item ? "page" : undefined} onClick={() => handleToolClick(item)}>{item}</button>)}
              </nav>}
            </section>
            <section className="tool-group ai-group">
              <button className="tool-group-title" type="button" aria-expanded={aiOpen} onClick={() => setAiOpen((value) => !value)}>
                <span>AI 工具箱</span><ChevronDown className={aiOpen ? "open" : ""} size={13} />
              </button>
              {aiOpen && <nav className="tool-list" aria-label="AI工具箱">
                {["文档翻译", "图片智能处理", "智能抽帧生成任务"].map((item) => <button key={item} type="button" className={activeTool === item ? "active" : ""} aria-current={activeTool === item ? "page" : undefined} onClick={() => handleToolClick(item)}>{item}</button>)}
              </nav>}
            </section>
          </div>
        </aside>
        <main className="page-template">
          <header className="page-title">智能抽帧生成任务</header>
          <div className="page-content">
            <form className="filter-card" onSubmit={handleSearch}>
              <button className="btn primary" type="button" onClick={() => setCreateTaskOpen(true)}><Plus size={15} /> 创建任务</button>
              <label className="filter-input-wrap product-id-filter"><span className="visually-hidden">商品 ID</span><input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="商品 ID" inputMode="numeric" /></label>
              <label className="filter-input-wrap generation-id-filter"><span className="visually-hidden">生成任务 ID</span><input value={generationTaskId} onChange={(e) => setGenerationTaskId(e.target.value)} placeholder="生成任务 ID" /></label>
              <div className="month-picker-wrap">
                <button className="control date-control" type="button" aria-label="选择月份" onClick={() => setMonthOpen((v) => !v)}><CalendarDays size={15} /><span>{month}</span><ChevronDown size={14} className="month-caret" /></button>
                {monthOpen && <div className="month-popover">
                  <div className="month-head"><button type="button" onClick={() => setMonth((m) => `${Number(m.slice(0,4)) - 1}-${m.slice(5)}`)}>‹</button><strong>{month.slice(0,4)} 年</strong><button type="button" onClick={() => setMonth((m) => `${Number(m.slice(0,4)) + 1}-${m.slice(5)}`)}>›</button></div>
                  <div className="month-grid">{Array.from({ length: 12 }, (_, i) => { const v = `${month.slice(0,4)}-${String(i + 1).padStart(2, "0")}`; return <button type="button" key={v} className={v === month ? "selected" : ""} onClick={() => { setMonth(v); setMonthOpen(false); }}>{i + 1} 月</button>; })}</div>
                </div>}
              </div>
              <div className="filter-actions">
                <button className="btn primary" type="submit"><Search size={15} /> 搜索</button>
              </div>
              <button className="btn advanced-settings-trigger" type="button" onClick={() => setAdvancedSettingsOpen(true)}>高级设置</button>
            </form>
            <section className="table-card" aria-label="目标进度数据表">
              <div className="table-frame">
                <div className="table-scroll" role="region" aria-label="目标进度表格，可横向滚动" tabIndex={0}>
                  <table key="original-progress-table" className="progress-table" aria-label="目标进度示意数据">
                <colgroup><col className="task-info-col" /><col className="finished-video-col" /><col className="product-col" /><col className="frame-output-col" /><col className="task-link-col" /></colgroup>
                <thead><tr>{headers.map((h, i) => <th key={`${i}-${h}`} scope="col"><div className="cell">{h}</div></th>)}</tr></thead>
                <tbody>
                  {visibleRows.map(({ g, row, taskLinks, taskNumber, generationTaskId, productId, isNew, batchId, batchSize, isBatchFirst, expanded }) => <tr key={taskNumber} className={isNew ? "new-task-row" : !isBatchFirst ? "batch-child-row" : "batch-first-row"}>
                    <td className="task-info-cell"><div className="cell">
                      <span className="task-info-number">{taskNumber}</span>
                      <span className="task-info-generation">生成任务 ID：{generationTaskId}</span>
                      {isBatchFirst && batchSize > 1 && <button className="batch-toggle" type="button" aria-expanded={expanded} aria-label={`${expanded ? "收起" : "展开"}批次 ${batchId} 的其余 ${batchSize - 1} 条任务`} onClick={() => toggleBatch(batchId)}>
                        <ChevronDown size={13} className={expanded ? "expanded" : ""} />
                        <span>{expanded ? "收起同批任务" : `展开同批 ${batchSize - 1} 条`}</span>
                      </button>}
                    </div></td>
                    <td className="finished-video-cell"><div className="cell">{isNew ? <span className="pending-output">待生成</span> : <FinishedVideo generationTaskId={generationTaskId} onPlay={setActiveVideo} />}</div></td>
                    <td className="product-cell"><div className="cell"><ProductSummary productId={productId} /></div></td>
                    <td className="frame-output-cell"><div className="cell">{isNew ? <span className="pending-output">正在抽帧</span> : <ThumbnailGrid label={`${g.store} ${row[0]}抽帧`} images={frameThumbnails} count={g.complete} />}</div></td>
                    <td className="task-link-cell"><div className="cell">{isNew ? <span className="pending-output">生成中</span> : <TaskLink href={taskLinks.frame} label={`${g.store} ${row[0]}随机镜头视频任务`} />}</div></td>
                  </tr>)}
                  {flatRows.length === 0 && <tr><td colSpan={headers.length} className="empty-cell">暂无数据</td></tr>}
                </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      {activeVideo && <VideoPreview video={activeVideo} onClose={() => setActiveVideo(null)} />}
      {createTaskOpen && <CreateTaskDialog files={taskFiles} onFilesChange={setTaskFiles} onCancel={closeCreateTask} onConfirm={handleCreateTask} />}
      {advancedSettingsOpen && <AdvancedSettingsDialog onClose={() => setAdvancedSettingsOpen(false)} onSave={saveAdvancedSettings} />}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}

export { App };
