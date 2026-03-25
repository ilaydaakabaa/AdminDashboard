<template>
  <div class="auth-layout">
    <div class="auth-layout__overlay"></div>
    <div class="auth-layout__blob auth-layout__blob--one"></div>
    <div class="auth-layout__blob auth-layout__blob--two"></div>

    <div class="auth-layout__container">
      <div class="auth-layout__left">
        <h1>Admin Dashboard</h1>
        <p>
          Yönetim paneline erişmek için lütfen giriş yapın veya yeni bir hesap oluşturun. 
        </p>
      </div>

      <div class="auth-layout__right">
        <div class="auth-card">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  position: relative;
  background:
    radial-gradient(circle at 12% 20%, #f6d365 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, #fda085 0%, transparent 38%),
    linear-gradient(130deg, #0f172a 0%, #1e293b 50%, #0b1220 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
}

.auth-layout__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.08));
}

.auth-layout__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.auth-layout__blob--one {
  width: 220px;
  height: 220px;
  background: rgba(251, 191, 36, 0.22);
  top: 10%;
  left: 4%;
}

.auth-layout__blob--two {
  width: 300px;
  height: 300px;
  background: rgba(251, 113, 133, 0.18);
  bottom: 8%;
  right: -4%;
}

.auth-layout__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 32px;
  align-items: center;
}

.auth-layout__left {
  color: white;
  padding: 24px;
}

.auth-layout__left h1 {
  margin: 0 0 16px;
  font-size: 46px;
  line-height: 1.1;
  font-weight: 800;
}

.auth-layout__left p {
  margin: 0 0 18px;
  max-width: 500px;
  font-size: 16px;
  line-height: 1.7;
  opacity: 0.92;
}

.auth-layout__right {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.22);
}

@media (max-width: 900px) {
  .auth-layout__container {
    grid-template-columns: 1fr;
  }

  .auth-layout__left {
    display: none;
  }

  .auth-card {
    max-width: 420px;
    margin: 0 auto;
  }
}
</style>