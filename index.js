const container = document.querySelector(".container");
const divProductos = document.querySelector("#divProductos");
const sidebar = document.querySelector(".sidebar");
const btnCarrito = document.querySelector(".btn-carrito");

const fulImgBox = document.getElementById("fulImgBox"),
  fulImg = document.getElementById("fulImg");


 window.onload = async () =>{
  const traerDatos = await fetch("./json/productos.json");
  let productos = await traerDatos.json();
  productos.forEach((productos) => {
    divProductos.innerHTML += `
    <div class="img-gallery div card cards-productos border-primary mb-3" id="producto${productos.id}" style="max-width: 18rem;">
    <img src="./img/${productos.img}" onclick="openFulImg(this.src)" class="card-img-top" alt="${productos.img}">
    <div class="card-body">
    <h4 class="nombre card-title">${productos.nombre}</h4>            
    <p class="card-text">${productos.talle}</p>
    <p class="precio">$<span>${productos.precio}</span></p>
    <button class="btn-agregar btn btn-primary " data-id="${productos.id}">Agregar al carrito</button>
    </div>
    </div>
    `;
  });

  const btnAgregar = document.querySelectorAll(".btn-agregar");
  btnAgregar.forEach((e) =>
    e.addEventListener("click", (e) => {
      let cardPadre = e.target.parentElement;

      agregarAlCarrito(cardPadre);
    })
  );


  
} 





function openFulImg(reference) {
  console.log(reference)
  fulImgBox.style.display = "flex";
  fulImg.src = reference;
}

function closeImg() {
  fulImgBox.style.display = "none";
}

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let isCarritoOpen = false;

btnCarrito.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire({
      title: "El carrito esta vacio",
      icon: "warning",
      confirmButtonColor: "#45b69d",
    });
  } else {
    isCarritoOpen = !isCarritoOpen;
  }
  if (isCarritoOpen) {
    sidebar.classList.add("active");
  } else {
    sidebar.classList.remove("active");
  }
});


const swaltToast = (texto, color) => {
  Swal.fire({
    text: texto,
    background: color,
    position: "bottom-end",
    toast: true,
    showConfirmButton: false,
    timer: 1400,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });
};

const agregarAlCarrito = (cardPadre) => {
  swaltToast("Producto agregado", "#89d692");

  let producto = {
    nombre: cardPadre.querySelector(".nombre").textContent,
    precio: Number(cardPadre.querySelector(".precio span").textContent),
    cantidad: 1,
    imagen: cardPadre.parentElement.querySelector("img").src,
    id: Number(cardPadre.querySelector("button").getAttribute("data-id")),
  };

  let productoEncontrado = carrito.find(
    (element) => element.id === producto.id
  );

  if (productoEncontrado) {
    productoEncontrado.cantidad++;
  } else {
    carrito.push(producto);
  }
  mostrarCarrito();
};

const mostrarCarrito = () => {
  let total = 0;
  sidebar.innerHTML = "";
  sidebar.innerHTML += `
        <div class="caja--carrito">
          <div class="caja--carrito--datos">
            <p class="nombre-art">Articulo</p>
            <p class="cantidad">Cantidad</p>
            <p class="precio">Precio unitario</p>
            <p class="subtotal">Subtotal</p>
            <div>
            </div>
          </div>   
        </div>
        `;
        
  carrito.forEach((productos) => {
    let { imagen, precio, cantidad, id } = productos;
    sidebar.innerHTML += `
        <div class="caja--carrito">
          <div class="caja--carrito--datos">
            <p><img class="caja-carrito-img" src="${imagen}"></p>
            <p class="cantidadNumero">${cantidad}</p>
            <p class="precioNumero">$${precio}</p>
            <p class="subtotal">$${precio * cantidad}</p>
            <div>
           
              <button class=" btn btn-primary btn-restar btn-restar-accion" data-id="${id}"><img src="./img/bin.png" class="img-carrito btn-restar-accion" data-id="${id}" alt=""/></button>
            
          </div>
          </div>    
        </div>
        `;
        total +=  precio * cantidad;
  }); 
  
  sidebar.innerHTML += `<div class="divTotal"><h3 class="total" >Total: ${total}</h3> </div>`
  sidebar.innerHTML += `
  <div class="botones-sidebar buttonCarrito">
  <button class=" btn btn-primary btn-limpiar ">Limpiar carrito</button>
  <button class="btn btn-primary btn-comprar ">Comprar</button>
  </div>
  `;

  localStorage.setItem("carrito", JSON.stringify(carrito));
  aumentarNumeroCantidadCarrito();
};

const restarProducto = (productoRestar) => {
  let productoEncontrado = carrito.find(
    (element) => element.id === Number(productoRestar)
  );
  if (productoEncontrado) {
    productoEncontrado.cantidad--;
    if (productoEncontrado.cantidad === 0) {
      borrarProducto(productoRestar);
    }
    swaltToast("Producto eliminado", "#d68989");
  }
  mostrarCarrito();
};

const borrarProducto = (productoBorrar) => {
  carrito = carrito.filter((element) => element.id !== Number(productoBorrar));
  if (carrito.length === 0) {
    sidebar.classList.remove("active");
    isCarritoOpen = false;
  }
  mostrarCarrito();
};

const limpiarCarrito = () => {
  carrito = [];
  sidebar.classList.remove("active");
  isCarritoOpen = false;
  mostrarCarrito();
};

const comprar = () => {
  sidebar.classList.remove("active");
  isCarritoOpen = false;
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Desea finalizar la compra?",
      text: "Si continuas ya no podras modificar el carrito de compras!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ok",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        document.querySelector(".cant--carrito").textContent = 0;
        carrito = [];
        swalWithBootstrapButtons.fire(
          "Muchas gracias por su compra!",
          "Un representante se pondra en contacot con usted",
          "success"
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire("Puedes seguir agregando productos");
      }
    });
  mostrarCarrito();
};

const escucharBotonesSidebar = () => {
  sidebar.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-restar-accion")) {
      restarProducto(e.target.getAttribute("data-id"));
    }
    if (e.target.classList.contains("btn-limpiar")) {
      limpiarCarrito();
    }
    if (e.target.classList.contains("btn-comprar")) {
      comprar();
    }
  });
};

const aumentarNumeroCantidadCarrito = () => {
  let total = carrito.reduce((acc, ite) => acc + ite.cantidad, 0);
  document.querySelector(".cant--carrito").textContent = total;
};


mostrarCarrito();
escucharBotonesSidebar();
