# Disramofor

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6.


# 🖥️ Front-end – Sistema de Gestión Comercial (Angular)

Bienvenido al front-end de la aplicación de gestión comercial. Esta interfaz fue desarrollada en **Angular** con enfoque modular, usando **Angular Material**, **Tailwind CSS** y herramientas modernas para generar reportes PDF y Excel, facilitando la gestión de pedidos y clientes en un entorno visual limpio y eficiente.

---

## 📘 ¿Qué hace este módulo?

- 🧾 Visualiza pedidos, clientes y productos de forma estructurada.
- 🧮 Permite crear, editar y eliminar registros (CRUD).
- 📊 Exporta reportes en **PDF y Excel** al instante.
- 📱 Cuenta con diseño responsivo y accesible gracias a Angular Material + Tailwind.

---

## 🧭 Arquitectura del Front-end

### 📁 Organización por funcionalidad
La app sigue una estructura **feature-based**, con carpetas como:

src/app/

├── clientes/ # Componentes para cliente-list y cliente-form

├── features/centro-pedidos/ # Componentes relacionados a pedidos

├── model/ # Interfaces TypeScript para clientes, productos, etc.

├── service/ # Servicios HTTP que consumen la API REST

├── shared/ # Navbar y otros componentes comunes


### 🧰 Tecnologías clave

- Angular 17+
- Angular Material
- Tailwind CSS
- RxJS
- TypeScript
- jsPDF, html2canvas, xlsx, file-saver

---

## 🔗 Documentación Oficial (Muy Importante)

> 📚 La **documentación técnica completa** de este front-end se encuentra publicada en Notion:
>
> 👉 [Ver documentación Front-end en Notion](https://petalite-pail-bb4.notion.site/Sistema-Degestion-De-pedidos-y-inventarios-Disramfor-1f8d6cfba8ba80e18683f4119d5556ce)

Ahí encontrarás:

- Diagramas visuales
- Explicación de estructura y dependencias
- Casos de uso y flujos de trabajo
- Buenas prácticas para nuevos desarrolladores

---
## 🖼️ Capturas del sistema

### 🧾 solicitud de pedido
![solicitud de pedido](src/assets/1.jpg)



### 📝 Formulario de cliente

![Formulario cliente](src/assets/cc88f3f5-1ca2-4747-a5b8-11b64dcd1c99.png)

> Puedes seguir agregando tus otras imágenes usando esta sintaxis:
> `![descripción](src/assets/nombre-archivo.png)`

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve
La app se cargará en http://localhost:4200


