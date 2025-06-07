# Password Manager

Aplicación para gestionar contraseñas de forma segura con una interfaz moderna y fácil de usar, desarrollada con Electron y tecnologías web.

## Características

- **Gestión segura de credenciales:** Guarda, edita y elimina contraseñas de manera cifrada.
- **Organización por carpetas:** Clasifica tus credenciales en carpetas personalizadas.
- **Generador de contraseñas:** Crea contraseñas seguras y aleatorias según tus necesidades.
- **Importación y exportación:** Importa y exporta tus credenciales en formato JSON.
- **Interfaz intuitiva:** Navegación sencilla y experiencia de usuario moderna.
- **Validación y alertas:** Mensajes claros para errores y acciones exitosas.

## Estructura del Proyecto
```
user-client/ 
│ 
├── main.js # Proceso principal de Electron 
├── config/ # Configuración de rutas y endpoints 
├── scripts/ # Funciones utilitarias y criptográficas 
│ ├── crypto.js 
│ └── userFunctionality.js 
├── renderers/ # Lógica de las ventanas (renderer process) 
│ ├── credentialRenderer.js 
│ ├── errorRenderer.js 
│ ├── exportImportRenderer.js 
│ ├── folderRenderer.js 
│ ├── indexRenderer.js 
│ ├── loginRenderer.js 
│ ├── passwordRenderer.js 
│ ├── signupRenderer.js 
│ ├── successRenderer.js 
│ ├── vaultRenderer.js 
│ └── welcomeRenderer.js 
├── resources/ # Imágenes, iconos y otros recursos estáticos 
├── views/ # Archivos HTML de las ventanas 
└──
```

## Requisitos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/)

## Instalación

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/tuusuario/password-manager.git
   cd password-manager/user-client
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

## Uso

1. **Inicia la aplicación:**
   ```sh
   npm start
   ```

2. **Registro e inicio de sesión:**
   - Al abrir la aplicación, puedes registrarte como nuevo usuario o iniciar sesión si ya tienes una cuenta.
   - La contraseña maestra nunca se almacena, solo se utiliza para derivar claves de cifrado.

3. **Gestión de credenciales:**
   - Añade, edita o elimina credenciales desde la interfaz principal.
   - Organiza tus credenciales en carpetas personalizadas.

4. **Herramientas:**
   - Usa el generador de contraseñas para crear contraseñas seguras.
   - Importa o exporta tus credenciales en formato JSON desde el menú de utilidades.

