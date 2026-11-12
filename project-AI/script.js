const PRODUCT = {
  name: "Essential Hoodie",
  price: 289000,
  image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
  variants: ["S", "M", "L", "XL"],
  stock: 12,
  description: "Hoodie kasual dengan bahan fleece lembut, cocok untuk aktivitas sehari-hari maupun bersantai di rumah.",
};

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const _ = window._;
const $ = (sel) => document.querySelector(sel);

const quantityOutput = $("#quantity");
const bagCount = $("#bag-count");
const bagButton = $(".bag-button");
const toast = $("#toast");
const heroImage = $("#hero-image");
const thumbnailList = $("#thumbnail-list");
const zoomThumbnailList = $("#zoom-thumbnails");
const quantityMinus = $("#quantity-minus");
const quantityPlus = $("#quantity-plus");
const addToBag = $("#add-to-bag");
const zoomTrigger = $("#zoom-trigger");
const zoomDialog = $("#image-zoom");
const zoomImage = $("#zoom-image");
const statusEl = $("#api-status");
const subtotalEl = $("#subtotal");
const validationEl = $("#validation-message");

let quantity = 1;
let activeVariant = PRODUCT.variants[0];
let bagItems = 0;
let activeImageIndex = 0;
let productImages = [];
let toastTimer;

function validateQuantity(val) {
  const num = Number(val);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return "Jumlah harus berupa bilangan bulat.";
  if (num < 1) return "Jumlah harus minimal 1.";
  if (num > PRODUCT.stock) return "Jumlah melebihi stok (" + PRODUCT.stock + ").";
  return null;
}

function updateSubtotal() {
  subtotalEl.textContent = "Subtotal: " + money.format(PRODUCT.price * quantity);
}

function clearValidation() {
  validationEl.textContent = "";
}

function updateQuantity(next) {
  quantity = Math.min(PRODUCT.stock, Math.max(1, next));
  quantityOutput.textContent = quantity;
  quantityMinus.disabled = quantity === 1;
  quantityPlus.disabled = quantity === PRODUCT.stock;
  updateSubtotal();
  clearValidation();
}

function setImage(index) {
  if (!productImages.length) return;
  activeImageIndex = index;
  const src = productImages[index];
  document.querySelectorAll(".thumbnail").forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
    el.setAttribute("aria-pressed", String(i === index));
  });
  document.querySelectorAll(".zoom-thumbnail").forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
    el.setAttribute("aria-pressed", String(i === index));
  });
  heroImage.src = src;
  heroImage.alt = "Foto " + PRODUCT.name;
  zoomImage.src = src;
  zoomImage.alt = heroImage.alt;
  const pos = String(index + 1).padStart(2, "0") + " / " + String(productImages.length).padStart(2, "0");
  $("#image-index").textContent = pos;
  $("#zoom-position").textContent = pos;
}

function createThumbnail(src, index, zoom) {
  const btn = document.createElement("button");
  btn.className = zoom ? "zoom-thumbnail" : "thumbnail";
  btn.type = "button";
  btn.setAttribute("aria-label", "Tampilkan gambar " + (index + 1));
  btn.setAttribute("aria-pressed", String(index === 0));
  const img = document.createElement("img");
  img.src = src;
  img.alt = zoom ? "" : "Foto " + PRODUCT.name;
  btn.append(img);
  btn.addEventListener("click", () => setImage(index));
  return btn;
}

function renderVariants() {
  const accords = $("#accords");
  accords.replaceChildren(
    ...PRODUCT.variants.map((v) => {
      const tag = document.createElement("span");
      tag.textContent = v;
      tag.dataset.variant = v;
      tag.setAttribute("role", "button");
      tag.setAttribute("tabindex", "0");
      tag.setAttribute("aria-pressed", String(v === activeVariant));
      if (v === activeVariant) tag.classList.add("is-active");
      tag.addEventListener("click", () => selectVariant(v));
      tag.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectVariant(v); } });
      return tag;
    })
  );
}

function selectVariant(variant) {
  activeVariant = variant;
  document.querySelectorAll("#accords [data-variant]").forEach((el) => {
    const active = el.dataset.variant === variant;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-pressed", String(active));
  });
  updateSubtotal();
}

function renderPage() {
  productImages = [PRODUCT.image];

  document.title = PRODUCT.name + " | Escentric Molecules";
  $('meta[name="description"]').content = PRODUCT.description.slice(0, 155);
  $("#breadcrumb-product").textContent = PRODUCT.name;
  $("#product-title").textContent = PRODUCT.name;
  $("#product-price").firstChild.textContent = money.format(PRODUCT.price) + " ";
  $("#stock-summary").textContent = PRODUCT.stock + " tersedia";
  $("#product-intro").textContent = PRODUCT.description;
  $("#product-description").textContent = PRODUCT.description;
  $("#product-variants").textContent = PRODUCT.variants.join(" · ");

  renderVariants();

  thumbnailList.replaceChildren();
  zoomThumbnailList.replaceChildren();
  productImages.forEach((src, i) => {
    thumbnailList.append(createThumbnail(src, i, false));
    zoomThumbnailList.append(createThumbnail(src, i, true));
  });

  zoomTrigger.disabled = false;
  setImage(0);

  addToBag.disabled = false;
  addToBag.innerHTML = 'Tambah ke tas <span aria-hidden="true">↗</span>';
  statusEl.textContent = "";

  updateQuantity(1);
}

quantityMinus.addEventListener("click", () => updateQuantity(quantity - 1));
quantityPlus.addEventListener("click", () => updateQuantity(quantity + 1));

zoomTrigger.addEventListener("click", () => { setImage(activeImageIndex); zoomDialog.showModal(); });
$("#zoom-close").addEventListener("click", () => zoomDialog.close());
$("#zoom-previous").addEventListener("click", () => setImage((activeImageIndex + productImages.length - 1) % productImages.length));
$("#zoom-next").addEventListener("click", () => setImage((activeImageIndex + 1) % productImages.length));
zoomDialog.addEventListener("click", (e) => { if (e.target === zoomDialog) zoomDialog.close(); });
zoomDialog.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") setImage((activeImageIndex + productImages.length - 1) % productImages.length);
  if (e.key === "ArrowRight") setImage((activeImageIndex + 1) % productImages.length);
});

$("#wishlist-button").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const saved = btn.getAttribute("aria-pressed") !== "true";
  btn.setAttribute("aria-pressed", String(saved));
  $("#wishlist-label").textContent = saved ? "Ditambahkan ke wishlist" : "Tambah ke wishlist";
  btn.querySelector(".wishlist-icon").textContent = saved ? "♥" : "♡";
});

document.querySelectorAll(".product-details details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".product-details details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

addToBag.addEventListener("click", () => {
  const error = validateQuantity(quantity);
  if (error) {
    validationEl.textContent = error;
    return;
  }
  clearValidation();
  bagItems = _.add(bagItems, quantity);
  bagCount.textContent = bagItems;
  bagButton.setAttribute("aria-label", "Tas belanja, " + bagItems + " item");
  toast.textContent = quantity + " " + PRODUCT.name + " (" + activeVariant + ") ditambahkan ke tas";
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
});

renderPage();
