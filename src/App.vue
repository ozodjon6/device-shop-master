<script setup lang="ts"></script>

<template>
  <div class="wrapper">
    <header class="container">
      <nav class="nav">
        <img src="/icons/logo.svg" alt="" />
        <img src="/icons/log-out.svg" alt="" />
      </nav>
    </header>
  </div>
  <RouterView />
</template>

<style scoped>
.wrapper {
  box-shadow: 0px 25px 40px 0px #00000008;
  background-color: #fff;
  padding: 16px 0;
  margin-bottom: 32px;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
