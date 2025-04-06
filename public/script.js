document.addEventListener("DOMContentLoaded", () => {
  // ORÁCULO ALEATORIO
  if (window.location.pathname.includes("oraculo.html")) {
    const mensajesIniciales = [
      "¿Qué deseas saber hoy?",
      "Haz tu pregunta... la sabiduría te escucha.",
      "Estoy aquí, viajero. ¿Cuál es tu inquietud?",
      "Tus palabras invocarán respuestas..."
    ];
    const mensaje = mensajesIniciales[Math.floor(Math.random() * mensajesIniciales.length)];
    document.getElementById("respuesta").innerText = mensaje;
  }

  // FORMULARIOS
  const formRegistro = document.getElementById("formRegistro");
  const formLogin = document.getElementById("formLogin");
  const preguntarBtn = document.getElementById("preguntarBtn");
  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  // REGISTRO
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();
      const datos = {
        nombre: formRegistro.nombre.value,
        apellido: formRegistro.apellido.value,
        fechaNacimiento: formRegistro.fechaNacimiento.value,
        usuario: formRegistro.usuario.value,
        correo: formRegistro.correo.value,
        password: formRegistro.password.value,
      };

      try {
        const res = await fetch("/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
        const resultado = await res.json();
        if (res.ok) {
          alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
          window.location.href = "index.html";
        } else {
          alert("❌ " + resultado.mensaje);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("❌ Error en el servidor. Intenta más tarde.");
      }
    });
  }

  // LOGIN
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const datos = {
        usuario: formLogin.usuario.value,
        password: formLogin.password.value,
      };

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
        const resultado = await res.json();
        if (res.ok) {
          localStorage.setItem("token", resultado.token);
          localStorage.setItem("usuario", datos.usuario);
          alert("✅ Bienvenido, " + datos.usuario);
          window.location.href = "voz-del-todo.html";
        } else {
          alert("❌ " + resultado.mensaje);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("❌ Error en el servidor. Intenta más tarde.");
      }
    });
  }

  // ORÁCULO
  if (preguntarBtn) {
    preguntarBtn.addEventListener("click", async () => {
      const pregunta = document.getElementById("pregunta").value.trim();
      const respuestaDiv = document.getElementById("respuesta");
      const token = localStorage.getItem("token");

      if (!pregunta) {
        alert("⚠️ Por favor, escribe una pregunta.");
        return;
      }

      try {
        const res = await fetch("/oraculo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({ pregunta }),
        });

        const resultado = await res.json();
        if (res.ok) {
          respuestaDiv.innerText = resultado.respuesta;
        } else {
          alert("❌ " + resultado.mensaje);
        }
      } catch (err) {
        console.error("Error al consultar el oráculo:", err);
        alert("❌ Error al consultar el oráculo.");
      }
    });
  }

  // CERRAR SESIÓN
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }

  // COMUNIDAD: MOSTRAR NOMBRE
  const elNombre = document.getElementById("nombreUsuario");
  const nombreUsuario = localStorage.getItem("usuario");
  if (elNombre && nombreUsuario) {
    elNombre.textContent = `Publicando como: ${nombreUsuario}`;
  }

  // PUBLICAR EN COMUNIDAD
  const publicarBtn = document.getElementById("publicarBtn");
  if (publicarBtn) {
    publicarBtn.addEventListener("click", async () => {
      const mensaje = document.getElementById("mensaje").value.trim();
      const usuario = localStorage.getItem("usuario") || "Anónimo";

      if (!mensaje) return alert("Debes escribir un mensaje.");

      try {
        const res = await fetch("/api/comunidad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autor: usuario, contenido: mensaje }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Mensaje publicado");
          document.getElementById("mensaje").value = "";
          cargarMensajes();
        } else {
          alert("❌ Error: " + data.mensaje);
        }
      } catch (err) {
        console.error("Error al publicar:", err);
        alert("❌ Error al conectar con el servidor.");
      }
    });
  }

  // CARGAR MENSAJES
  async function cargarMensajes() {
    try {
      const res = await fetch("/api/comunidad");
      const posts = await res.json();
      const contenedor = document.getElementById("publicaciones");
      if (!contenedor) return;

      contenedor.innerHTML = "";
      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `
          <strong>${post.autor}</strong>
          <p>${post.contenido}</p>
          <small>${new Date(post.fecha).toLocaleString()}</small>
        `;
        contenedor.appendChild(div);
      });
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  }

  cargarMensajes();
});

