import { productos } from "./productos.js";

document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURACIÓN
  const tuNumeroDeWhatsApp = "584124618344";

  // SELECTORES DEL DOM
  let carrito = [];
  const productGrid = document.getElementById("product-grid");
  const categoryFilters = document.getElementById("category-filters");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const openCartButton = document.getElementById("open-cart-button");
  const closeCartButton = document.getElementById("close-cart-button");
  const cartModal = document.getElementById("cart-modal");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCounter = document.getElementById("cart-counter");
  const cartTotal = document.getElementById("cart-total");
  const whatsappButton = document.getElementById("whatsapp-button");
  const optionsModal = document.getElementById("options-modal");
  const closeOptionsButton = document.getElementById("close-options-button");
  const optionsForm = document.getElementById("options-form");
  const optionsTitle = document.getElementById("options-title");
  const optionsImage = document.getElementById("options-image");
  const optionsGallery = document.getElementById("options-gallery");
  const personalizacionFields = document.getElementById("personalizacion-fields");
  const playerNameInput = document.getElementById("player-name");
  const playerNumberInput = document.getElementById("player-number");
  const toast = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  const header = document.getElementById("header");
  const backToTopButton = document.getElementById("back-to-top-btn");

  // FUNCIONES DE LA APLICACIÓN

  function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem("galaxySportCart");
    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
      actualizarCarrito();
    }
  }

  function guardarCarritoEnStorage() {
    localStorage.setItem("galaxySportCart", JSON.stringify(carrito));
  }

  function mostrarToast(mensaje) {
    toastMessage.textContent = mensaje;
    toast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => {
      toast.classList.add("translate-y-20", "opacity-0");
    }, 3000);
  }

  function renderizarFiltros() {
    const categorias = ["all", ...new Set(productos.map((p) => p.categoria))];
    categoryFilters.innerHTML = "";
    categorias.forEach((cat) => {
      let nombreAmigable = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ");
      if (cat === "all") nombreAmigable = "Todos";

      const button = document.createElement("button");
      button.className = "category-btn font-semibold py-2 px-5 rounded-full";
      button.textContent = nombreAmigable;
      button.dataset.category = cat;
      if (cat === "all") button.classList.add("active");
      categoryFilters.appendChild(button);
    });
  }

  function renderizarProductos() {
    productGrid.innerHTML = "";
    const filtroCategoria =
      document.querySelector(".category-btn.active")?.dataset.category || "all";
    const terminoBusqueda = searchInput.value.toLowerCase().trim();
    const sortValue = sortSelect.value;

    let productosFiltrados = productos.filter((p) => {
      const pasaCategoria = filtroCategoria === "all" || p.categoria === filtroCategoria;
      const pasaBusqueda =
        !terminoBusqueda ||
        p.nombre.toLowerCase().includes(terminoBusqueda) ||
        p.descripcion.toLowerCase().includes(terminoBusqueda) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(terminoBusqueda)));
      return pasaCategoria && pasaBusqueda;
    });

    let productosAMostrar = [...productosFiltrados];
    switch (sortValue) {
      case "price-asc":
        productosAMostrar.sort((a, b) => a.precio - b.precio);
        break;
      case "price-desc":
        productosAMostrar.sort((a, b) => b.precio - a.precio);
        break;
      case "newest":
        productosAMostrar.sort((a, b) => (b.nuevo === a.nuevo ? 0 : b.nuevo ? 1 : -1));
        break;
    }

    if (productosAMostrar.length === 0) {
      productGrid.innerHTML = `<p class="col-span-full text-center text-gray-400 text-lg">No se encontraron productos.</p>`;
      return;
    }

    productosAMostrar.forEach((producto) => {
      const estaAgotado = !producto.disponible;
      const productoHTML = `
              <div class="bg-[var(--bg-light)] rounded-xl overflow-hidden shadow-lg group transition-transform duration-300 hover:scale-105 hover:shadow-[var(--primary)/20%] ${
                estaAgotado ? "opacity-60" : ""
              }" data-aos="fade-up">
                <div class="relative overflow-hidden">
                  ${
                    producto.nuevo
                      ? '<span class="absolute top-3 left-3 bg-[var(--secondary)] text-black text-xs font-bold px-3 py-1 rounded-full z-10">NUEVO</span>'
                      : ""
                  }
                  <span class="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full z-10 ${
                    estaAgotado ? "bg-red-600" : "bg-green-500"
                  }">${estaAgotado ? "AGOTADO" : "DISPONIBLE"}</span>

                  <img src="${producto.imagen}" alt="${
        producto.nombre
      }" loading="lazy" class="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110">
                  <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button class="open-options-btn text-white text-lg bg-[var(--primary)] py-2 px-6 rounded-full hover:bg-[var(--secondary)] hover:text-black font-semibold" data-id="${
                      producto.id
                    }" ${estaAgotado ? "disabled" : ""}>
                      ${estaAgotado ? "No Disponible" : "Añadir al Pedido"}
                    </button>
                  </div>
                </div>
                <div class="p-5 text-center">
                  <h3 class="text-xl font-bold text-white">${producto.nombre}</h3>
                  <p class="text-[var(--text-dark)] mt-1">${producto.descripcion}</p>
                  <p class="text-2xl font-bold text-[var(--secondary)] mt-2">$${producto.precio.toFixed(
                    2
                  )}</p>
                </div>
              </div>`;
      productGrid.innerHTML += productoHTML;
    });
    AOS.refresh();
  }

  function abrirModalOpciones(idProducto) {
    const producto = productos.find((p) => p.id === idProducto);
    if (!producto) return;

    optionsTitle.textContent = producto.nombre;
    optionsForm.dataset.productId = idProducto;

    document.getElementById("add-from-options-btn").disabled = !producto.disponible;

    optionsGallery.innerHTML = "";
    if (producto.galeria && producto.galeria.length > 0) {
      optionsImage.src = producto.galeria[0];
      producto.galeria.forEach((imgUrl, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgUrl;
        thumb.alt = `Vista ${index + 1}`;
        thumb.className =
          "w-12 h-12 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-[var(--primary)] transition-all";
        thumb.classList.toggle("border-[var(--primary)]", index === 0);
        thumb.dataset.fullSrc = imgUrl;
        optionsGallery.appendChild(thumb);
      });
    } else {
      optionsImage.src = producto.imagen;
    }

    const tallaContainer = document.getElementById("talla-selector-container");
    tallaContainer.innerHTML = "";
    producto.tallas.forEach((talla, index) => {
      const isChecked = index === 0 ? "checked" : "";
      tallaContainer.innerHTML += `
              <div>
                <input type="radio" id="talla-${talla}-${producto.id}" name="talla" value="${talla}" class="talla-radio-input" ${isChecked}>
                <label for="talla-${talla}-${producto.id}" class="talla-radio-label">${talla}</label>
              </div>`;
    });

    if (producto.personalizable) {
      personalizacionFields.classList.remove("hidden");
    } else {
      personalizacionFields.classList.add("hidden");
    }

    playerNameInput.value = "";
    playerNumberInput.value = "";

    optionsModal.classList.remove("opacity-0", "pointer-events-none");
    document.getElementById("options-modal-content").classList.remove("scale-95");
  }

  function cerrarModalOpciones() {
    optionsModal.classList.add("opacity-0", "pointer-events-none");
    document.getElementById("options-modal-content").classList.add("scale-95");
  }

  function agregarAlCarrito(itemParaAgregar) {
    const { id, talla, nombreJugador, numeroJugador } = itemParaAgregar;
    const itemExistente = carrito.find(
      (item) =>
        item.id === id &&
        item.talla === talla &&
        item.nombreJugador === nombreJugador &&
        item.numeroJugador === numeroJugador
    );

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      carrito.push({ ...itemParaAgregar, cantidad: 1 });
    }
    actualizarCarrito();
    mostrarToast("¡Agregado al pedido!");
  }

  function actualizarCantidad(cartItemId, nuevaCantidad) {
    const itemIndex = carrito.findIndex((item) => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
      if (nuevaCantidad <= 0) {
        carrito.splice(itemIndex, 1);
        mostrarToast("Producto eliminado.");
      } else {
        carrito[itemIndex].cantidad = nuevaCantidad;
      }
      actualizarCarrito();
    }
  }

  function actualizarCarrito() {
    renderizarItemsCarrito();
    actualizarTotal();
    actualizarContadorCarrito();
    guardarCarritoEnStorage();
  }

  function renderizarItemsCarrito() {
    cartItemsContainer.innerHTML = "";
    if (carrito.length === 0) {
      cartItemsContainer.innerHTML = `<div class="text-center py-8">
                <ion-icon name="sad-outline" class="text-6xl text-gray-600"></ion-icon>
                <p class="text-gray-400 mt-2">Tu pedido está vacío.</p>
                <button id="close-and-shop" class="mt-4 bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-full text-md hover:opacity-90 transition-all">Empezar a comprar</button>
              </div>`;
      whatsappButton.disabled = true;
      return;
    }
    whatsappButton.disabled = false;
    carrito.forEach((item) => {
      let detalles = `Talla: ${item.talla}`;
      if (item.nombreJugador) {
        detalles += ` | ${item.nombreJugador} #${item.numeroJugador}`;
      }
      const subtotal = item.precioFinal * item.cantidad;
      const itemHTML = `
              <div class="flex items-center gap-4 py-3">
                <img src="${item.imagen}" alt="${
        item.nombre
      }" class="w-16 h-16 rounded-md object-cover">
                <div class="flex-1">
                  <h4 class="font-bold">${item.nombre}</h4>
                  <p class="text-sm text-gray-400">${detalles}</p>
                  <p class="text-[var(--secondary)] font-semibold">$${subtotal.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-3 bg-[var(--bg-dark)] p-1 rounded-full">
                    <button class="quantity-btn w-7 h-7 flex items-center justify-center rounded-full bg-[var(--primary)]" data-id="${
                      item.cartItemId
                    }" data-action="decrement">-</button>
                    <span class="font-bold text-md w-5 text-center">${item.cantidad}</span>
                    <button class="quantity-btn w-7 h-7 flex items-center justify-center rounded-full bg-[var(--primary)]" data-id="${
                      item.cartItemId
                    }" data-action="increment">+</button>
                </div>
              </div>`;
      cartItemsContainer.innerHTML += itemHTML;
    });
  }

  function actualizarTotal() {
    const total = carrito.reduce((acc, item) => acc + item.precioFinal * item.cantidad, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    cartCounter.textContent = totalItems;
    if (totalItems > 0 && document.activeElement.closest(".open-options-btn")) {
      cartCounter.classList.add("cart-pop");
      setTimeout(() => cartCounter.classList.remove("cart-pop"), 300);
    }
  }

  function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    let mensaje = "¡Hola Galaxy Sport!  Quiero hacer un pedido con los siguientes productos:\n\n";
    carrito.forEach((item) => {
      let detalleItem = `*- ${item.nombre} (x${item.cantidad})*\n`;
      detalleItem += `  Talla: ${item.talla}\n`;
      if (item.nombreJugador && item.numeroJugador) {
        detalleItem += `  Personalización: ${item.nombreJugador}, #${item.numeroJugador}\n`;
      }
      const subtotal = item.precioFinal * item.cantidad;
      detalleItem += `  Subtotal: $${subtotal.toFixed(2)}\n\n`;
      mensaje += detalleItem;
    });
    const total = carrito.reduce((acc, item) => acc + item.precioFinal * item.cantidad, 0);
    mensaje += `*Total a pagar: $${total.toFixed(
      2
    )}*\n\nEspero su respuesta para coordinar. ¡Gracias!`;
    const urlWhatsApp = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, "_blank");
  }

  productGrid.addEventListener("click", (e) => {
    const optionsBtn = e.target.closest(".open-options-btn");
    if (optionsBtn && !optionsBtn.disabled) {
      abrirModalOpciones(parseInt(optionsBtn.dataset.id));
    }
  });

  optionsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const productId = parseInt(e.target.dataset.productId);
    const productoBase = productos.find((p) => p.id === productId);
    const nombreJugador = playerNameInput.value.trim().toUpperCase();
    const numeroJugador = playerNumberInput.value.trim();
    let precioFinal = productoBase.precio;
    if (productoBase.personalizable && (nombreJugador || numeroJugador)) {
      precioFinal += productoBase.costoPersonalizacion;
    }
    const tallaSeleccionada = document.querySelector('input[name="talla"]:checked').value;
    const itemParaCarrito = {
      ...productoBase,
      cartItemId: Date.now() + Math.random(),
      talla: tallaSeleccionada,
      nombreJugador,
      numeroJugador,
      precioFinal,
    };
    agregarAlCarrito(itemParaCarrito);
    cerrarModalOpciones();
  });

  optionsGallery.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG" && e.target.dataset.fullSrc) {
      optionsImage.src = e.target.dataset.fullSrc;
      [...e.target.parentElement.children].forEach((child) =>
        child.classList.remove("border-[var(--primary)]")
      );
      e.target.classList.add("border-[var(--primary)]");
    }
  });

  cartItemsContainer.addEventListener("click", (e) => {
    const quantityBtn = e.target.closest(".quantity-btn");
    if (quantityBtn) {
      const cartItemId = parseFloat(quantityBtn.dataset.id);
      const action = quantityBtn.dataset.action;
      const item = carrito.find((i) => i.cartItemId === cartItemId);
      if (item) {
        const newQuantity = action === "increment" ? item.cantidad + 1 : item.cantidad - 1;
        actualizarCantidad(cartItemId, newQuantity);
      }
    }
    const shopBtn = e.target.closest("#close-and-shop");
    if (shopBtn) {
      cerrarModalCarrito();
    }
  });

  categoryFilters.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      document.querySelector(".category-btn.active")?.classList.remove("active");
      e.target.classList.add("active");
      renderizarProductos();
    }
  });

  searchInput.addEventListener("input", renderizarProductos);
  sortSelect.addEventListener("change", renderizarProductos);

  function abrirModalCarrito() {
    cartModal.classList.remove("opacity-0", "pointer-events-none");
    document.getElementById("cart-modal-content").classList.remove("scale-95");
  }

  function cerrarModalCarrito() {
    cartModal.classList.add("opacity-0", "pointer-events-none");
    document.getElementById("cart-modal-content").classList.add("scale-95");
  }

  openCartButton.addEventListener("click", abrirModalCarrito);
  closeCartButton.addEventListener("click", cerrarModalCarrito);
  closeOptionsButton.addEventListener("click", cerrarModalOpciones);
  whatsappButton.addEventListener("click", enviarPedidoWhatsApp);

  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) cerrarModalCarrito();
  });
  optionsModal.addEventListener("click", (e) => {
    if (e.target === optionsModal) cerrarModalOpciones();
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) header.classList.add("nav-scrolled");
    else header.classList.remove("nav-scrolled");
    if (window.scrollY > 400) backToTopButton.classList.add("show");
    else backToTopButton.classList.remove("show");
  });

  backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // INICIALIZACIÓN de animaciones y carga inicial
  AOS.init({ duration: 800, once: true, offset: 50 });
  cargarCarritoDesdeStorage();
  renderizarFiltros();
  renderizarProductos();
});
