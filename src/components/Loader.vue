<!-- src\components\Loader.vue -->
<template>
  <div class="loader-overlay">
    <div class="tagcloud-wrapper">
      <div class="tagcloud-rotation">
        <ul
          class="tagcloud-tags"
          style="--num-elements: 24"
        >
          <li
            class="tagcloud-tag"
            style="--index: 1"
          >
            <div><span>water</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 2"
          >
            <div><span>livre</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 3"
          >
            <div><span>blume</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 4"
          >
            <div><span>praia</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 5"
          >
            <div><span>fiets</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 6"
          >
            <div><span>ptak</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 7"
          >
            <div><span>strom</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 8"
          >
            <div><span>asztal</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 9"
          >
            <div><span>tuli</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 10"
          >
            <div><span>fjell</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 11"
          >
            <div><span>havet</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 12"
          >
            <div><span>cerul</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 13"
          >
            <div><span>riba</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 14"
          >
            <div><span>domov</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 15"
          >
            <div><span>casa</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 16"
          >
            <div><span>поле</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 17"
          >
            <div><span>libro</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 18"
          >
            <div><span>bord</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 19"
          >
            <div><span>рука</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 20"
          >
            <div><span>fenêtre</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 21"
          >
            <div><span>kutya</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 22"
          >
            <div><span>řeka</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 23"
          >
            <div><span>schule</span></div>
          </li>
          <li
            class="tagcloud-tag"
            style="--index: 24"
          >
            <div><span>jabłko</span></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-card);
  overflow: hidden;
}
.tagcloud-wrapper {
  --size: 320px;
  --_radius: calc(var(--size) / 2 - 44px);
  font-family: 'Open Sans', sans-serif;
  font-size: var(--sm);
}
.tagcloud-wrapper,
.tagcloud-rotation,
.tagcloud-tags {
  width: var(--size);
  aspect-ratio: 1 / 1;
}
.tagcloud-wrapper .tagcloud-rotation {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  perspective: calc(var(--size) * 2);
  background: radial-gradient(rgba(242, 238, 233, 0.75), 15%, rgba(242, 238, 233, 0) 65%);
  border-radius: 50%;
}
.tagcloud-wrapper .tagcloud-tags {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  list-style-type: none;
  transform-style: inherit;
  animation: tagcloud-rotation 5s normal linear infinite running;
}
@keyframes tagcloud-rotation {
  from {
    transform: translate(-50%, -50%) rotateX(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotateX(360deg);
  }
}
.tagcloud-wrapper .tagcloud-tag {
  --_phi: acos(calc(-1 + (2 * var(--index)) / var(--num-elements)));
  --_theta: calc(sqrt(calc(var(--num-elements) * 3.1415926535)) * var(--_phi));
  --_x: calc(cos(var(--_theta)) * sin(var(--_phi)));
  --_y: calc(sin(var(--_theta)) * sin(var(--_phi)));
  --_z: calc(cos(var(--_phi)));
  --_scaled-x: calc(var(--_x) * var(--_radius));
  --_scaled-y: calc(var(--_y) * var(--_radius));
  --_scaled-z: calc(var(--_z) * var(--_radius));
  --_final-x: calc(var(--_scaled-x) + var(--_radius));
  --_final-y: calc(var(--_scaled-y) + var(--_radius));
  --_final-z: var(--_scaled-z);

  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  transition: opacity 50ms ease-out;
  transform: translate3d(var(--_final-x), var(--_final-y), var(--_final-z));
  animation: tagcloud-tag-rotation 5s normal linear infinite running;
}
@keyframes tagcloud-tag-rotation {
  from {
    transform: translate3d(var(--_final-x), var(--_final-y), var(--_final-z)) rotateX(360deg);
  }
  to {
    transform: translate3d(var(--_final-x), var(--_final-y), var(--_final-z)) rotateX(0deg);
  }
}
.tagcloud-wrapper .tagcloud-tag div {
  transform: rotateZ(0deg);
}
.tagcloud-wrapper .tagcloud-tag div span {
  color: var(--text-head);
  text-decoration: none;
  font-weight: bold;
}
</style>
