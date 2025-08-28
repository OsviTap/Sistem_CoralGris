# 🚀 Sistema CoralGris - Deploy Guide

## 📋 Descripción
Sistema de gestión de productos y pedidos para CoralGris, desarrollado con Vue.js 3 + Node.js + PostgreSQL.

## 🛠️ Stack Tecnológico
- **Frontend:** Vue.js 3 + Vite + Tailwind CSS + Pinia
- **Backend:** Node.js + Express.js + Sequelize ORM
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT
- **AI:** Hugging Face Inference API + NLP

## 🚀 Opciones de Deploy

### 1. 🥇 VERCEL (Frontend) + RAILWAY (Backend) - RECOMENDADO

#### Frontend en Vercel:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la carpeta frontend/
cd frontend
vercel

# Seguir las instrucciones
# - Conectar con GitHub
# - Seleccionar proyecto
# - Deploy automático
```

#### Backend en Railway:
```bash
# Ir a railway.app
# - Conectar con GitHub
# - Seleccionar carpeta backend/
# - Configurar variables de entorno
# - Deploy automático
```

### 2. 🥈 RENDER (Alternativa económica)

#### Frontend:
- Crear cuenta en render.com
- Conectar repositorio GitHub
- Configurar como Static Site
- Build Command: `npm run build`
- Publish Directory: `dist`

#### Backend:
- Crear Web Service
- Conectar repositorio GitHub
- Build Command: `npm install`
- Start Command: `npm start`

## 🔧 Variables de Entorno

### Backend (.env):
```env
DATABASE_URL=postgres://user:pass@host:port/db
JWT_SECRET=tu_jwt_secret_super_seguro
NODE_ENV=production
PORT=3006
```

### Frontend (.env.production):
```env
VITE_API_URL=https://tu-backend.railway.app
VITE_APP_TITLE=Sistema CoralGris
```

## 📁 Estructura del Proyecto
```
Sistema_CoralGris/
├── frontend/          # Vue.js 3 + Vite
├── backend/           # Node.js + Express
├── vercel.json        # Config Vercel
├── railway.json       # Config Railway
└── README.md
```

## 🚀 Comandos de Deploy

### Frontend (Vercel):
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway):
```bash
cd backend
railway up
```

## 🔍 Verificar Deploy

### Frontend:
- ✅ https://tu-app.vercel.app
- ✅ Sin errores en consola
- ✅ API calls funcionando

### Backend:
- ✅ https://tu-backend.railway.app/health
- ✅ Base de datos conectada
- ✅ Logs sin errores

## 💰 Costos Estimados

### Vercel (Frontend):
- **Gratis** para proyectos personales
- 100GB de ancho de banda/mes

### Railway (Backend):
- **$5/mes** incluye:
  - Backend Node.js
  - Base de datos PostgreSQL
  - Deploy automático
  - SSL automático

### Total: **$5/mes** 🎉

## 🆘 Troubleshooting

### Error 500 en Frontend:
- Verificar variables de entorno
- Revisar logs de Vercel

### Error de Base de Datos:
- Verificar DATABASE_URL en Railway
- Revisar logs del backend

### CORS Errors:
- Verificar configuración de Vercel
- Revisar headers en backend

## 📞 Soporte
- **Vercel:** Documentación oficial
- **Railway:** Discord community
- **Proyecto:** Issues en GitHub

---

**¡Tu proyecto está listo para producción! 🚀**
