<template>
  <div>
    <div class="toastnotification-header">
      <font-awesome-icon icon="fa-light fa-triangle-exclamation" />
      <span class="toast-title">Warning</span>
      <span></span>
    </div>
    <div>
      <div class="toastnotification-content">Amount must be greater than zero.</div>
    </div>
  </div>
</template>

<style>
.Vue-Toastification__toast {
  background-color: #ffffff !important;
}
.toast-title,
.toastnotification-content {
  color: #171717;
}

.toastnotification-header {
  font-weight: bold;
}

.Vue-Toastification__icon,
.Vue-Toastification__close-button {
  color: #febc71 !important;
}

.Vue-Toastification__icon {
  margin: 6px 18px auto 0px !important;
}

.Vue-Toastification__close-button {
  opacity: unset !important;
  height: 20px;
}

/* .Vue-Toastification__icon{
    background-image: url(/images/notifications/triangle-exclamation.svg) !important;
    background-size: 20px 20px !important;
    width: 20px !important;
    height: 20px !important;
    background-repeat: no-repeat !important;
} */
</style>
