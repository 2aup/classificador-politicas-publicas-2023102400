<script setup>
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useI18n } from 'vue-i18n'
import { useRouter } from "vue-router";

const { t } = useI18n()
const router = useRouter();

defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "open-settings"]);
const menuRef = ref(null);

onClickOutside(menuRef, () => emit("close"));

function openSettings() {
  emit("open-settings");
  emit("close");
}

async function logout() {
  emit("close");

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  try {
    await fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    localStorage.removeItem("auth");

    window.location.href = "/login";
  }
}
</script>

<template>
  <div v-if="show" ref="menuRef" class="menu-container">
    <ul>
      <li @click="openSettings">
        <svg class="icons" width="506" height="518" viewBox="0 0 506 518" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path class="fill-not" fill-rule="evenodd" clip-rule="evenodd"
            d="M230.25 492.333C218.337 492.333 208.173 483.49 206.233 471.433C204.447 461.68 197.6 453.71 188.39 450.667C180.886 448.023 173.548 444.907 166.42 441.333C157.938 436.883 147.763 437.55 139.9 443.067C130.385 450.083 117.314 448.997 109.025 440.5L76.7853 407.433C68.1086 398.533 66.9813 384.503 74.1203 374.267C79.626 366.017 80.419 355.38 76.2003 346.367C73.4206 340.107 70.9686 333.697 68.8553 327.167C65.8283 316.877 57.4733 309.17 47.1776 307.167C34.7623 305.133 25.5966 294.197 25.5003 281.3V239.933C25.4343 225.07 35.9016 212.357 50.2003 209.933C61.0476 207.817 70.1053 200.197 74.2503 189.7C75.4853 186.744 76.7853 183.811 78.1503 180.9C83.663 170.015 82.9016 156.904 76.1676 146.767C67.7466 134.763 69.0396 118.27 79.2226 107.8L102.915 83.5C114.601 71.5107 133.03 69.959 146.465 79.8333L147.213 80.3667C157.245 87.292 170.011 88.5463 181.143 83.7C193.052 79.3037 201.83 68.808 204.25 56.0667L204.577 54.9333C207.25 38.0657 221.453 25.6737 238.117 25.6667H266.717C283.827 25.6587 298.43 38.3523 301.23 55.6667L301.75 58C304.047 70.2057 312.37 80.3073 323.72 84.6667C334.66 89.4823 347.24 88.2247 357.067 81.3333L358.69 80.1333C372.473 69.9447 391.427 71.5117 403.443 83.8333L425.25 106.233C436.18 117.505 437.553 135.231 428.5 148.133C421.407 158.917 420.503 172.775 426.127 184.433L427.527 187.767C432.08 199.15 441.937 207.4 453.72 209.7C469.123 212.277 480.45 225.897 480.5 241.9V279C480.497 293.113 470.543 305.153 456.97 307.467C445.807 309.663 436.713 317.953 433.277 329.067C431.76 333.51 430.07 337.957 428.207 342.4C423.87 352.167 424.833 363.547 430.743 372.4C438.54 383.527 437.33 398.81 427.883 408.5L397.627 439.567C388.973 448.44 375.327 449.583 365.387 442.267C357.087 436.45 346.337 435.81 337.437 440.6C331.093 443.823 324.583 446.683 317.937 449.167C308.64 452.457 301.787 460.617 299.997 470.533C298.1 483.01 287.67 492.24 275.36 492.333H230.25Z"
            stroke="black" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" />
          <path class="fill-not" fill-rule="evenodd" clip-rule="evenodd"
            d="M328.823 259C328.823 301.95 294.877 336.767 253 336.767C211.123 336.767 177.178 301.95 177.178 259C177.178 216.05 211.123 181.233 253 181.233C294.877 181.233 328.823 216.05 328.823 259Z"
            stroke="black" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t("settings.settings") }}
      </li>
      <li>
        <svg class="icons" width="400" height="496" viewBox="0 0 400 496" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path class="fill-not" fill-rule="evenodd" clip-rule="evenodd"
            d="M152 376C146.781 307.587 92.4138 253.219 24 248C92.4138 242.781 146.781 188.413 152 120C157.219 188.413 211.587 242.781 280 248C211.587 253.219 157.219 307.587 152 376Z"
            stroke="black" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" />
          <path class="fill-not" fill-rule="evenodd" clip-rule="evenodd"
            d="M312 472C309.382 437.795 282.205 410.618 248 408C282.205 405.382 309.382 378.205 312 344C314.618 378.205 341.795 405.382 376 408C341.795 410.618 314.618 437.795 312 472Z"
            stroke="black" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" />
          <path class="fill-not" fill-rule="evenodd" clip-rule="evenodd"
            d="M312 24C309.382 58.2038 282.205 85.3834 248 88C282.205 90.6166 309.382 117.796 312 152C314.618 117.796 341.795 90.6166 376 88C341.795 85.3834 314.618 58.2038 312 24Z"
            stroke="black" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <a href="https://chatficanafacul.com.br" target="_blank">{{ t("settings.questions") }}</a>
      </li>
      <hr>
      <li @click="logout">
        <svg class="icons" width="624" height="496" viewBox="0 0 624 496" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path class="fill-me"
            d="M137.408 169.013C146.804 159.664 146.842 144.468 137.493 135.072C128.144 125.676 112.948 125.638 103.552 134.987L137.408 169.013ZM7.07168 230.986C-2.32416 240.336 -2.36192 255.533 6.9872 264.928C16.3363 274.323 31.5322 274.362 40.9283 265.014L7.07168 230.986ZM40.9283 230.986C31.5322 221.638 16.3363 221.677 6.9872 231.072C-2.36192 240.467 -2.32416 255.664 7.07168 265.014L40.9283 230.986ZM103.552 361.014C112.948 370.362 128.144 370.323 137.493 360.928C146.842 351.533 146.804 336.336 137.408 326.986L103.552 361.014ZM24 224C10.7453 224 0 234.746 0 248C0 261.254 10.7453 272 24 272V224ZM472 272C485.254 272 496 261.254 496 248C496 234.746 485.254 224 472 224V272ZM103.552 134.987L7.07168 230.986L40.9283 265.014L137.408 169.013L103.552 134.987ZM7.07168 265.014L103.552 361.014L137.408 326.986L40.9283 230.986L7.07168 265.014ZM24 272H472V224H24V272Z"
            fill="black" />
          <path class="fill-not"
            d="M216 344C216 414.691 273.309 472 344 472H472C542.691 472 600 414.691 600 344V152C600 81.3075 542.691 24 472 24H344C273.309 24 216 81.3075 216 152"
            stroke="black" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t("settings.logout") }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.menu-container {
  position: absolute;
  top: 3rem;
  right: 0;
  background: var(--color-menu-bg);
  border: 1px solid var(--blue-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  width: 12rem;
  z-index: 50;
  animation: fadeIn 0.2s ease-in-out;
  pointer-events: auto;
  padding: 0.5rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 14px;
  color: var(--theme-text);
  transition: background 0.2s;
  padding: 0.3rem;
}

li:hover {
  background-color: var(--color-li-hover);
  border-radius: var(--radius-sm);
}

hr {
  border-radius: var(--radius-md);
  opacity: 20%;
  color: var(--theme-text);
}

a {
  font-weight: normal !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
