<!-- src\components\Loader.vue -->
<template>
  <div class="loader-overlay">
    <div class="tagcloud-wrapper">
      <div class="tagcloud-rotation">
        <ul class="tagcloud-tags" style="--num-elements: 48">
          <li class="tagcloud-tag" style="--index: 1">
            <div><span>la</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 2">
            <div><span>mér</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 3">
            <div><span>du</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 4">
            <div><span>Ofe</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 5">
            <div><span>zä</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 6">
            <div><span>Åil</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 7">
            <div><span>po</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 8">
            <div><span>tro</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 9">
            <div><span>Ces</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 10">
            <div><span>ka</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 11">
            <div><span>re</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 12">
            <div><span>ün</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 13">
            <div><span>bi</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 14">
            <div><span>Alo</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 15">
            <div><span>ne</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 16">
            <div><span>di</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 17">
            <div><span>Wäl</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 18">
            <div><span>vo</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 19">
            <div><span>da</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 20">
            <div><span>ty</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 21">
            <div><span>he</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 22">
            <div><span>te</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 23">
            <div><span>sör</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 24">
            <div><span>gi</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 25">
            <div><span>le</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 26">
            <div><span>mo</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 27">
            <div><span>rá</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 28">
            <div><span>vi</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 29">
            <div><span>li</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 30">
            <div><span>bu</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 31">
            <div><span>so</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 32">
            <div><span>pa</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 33">
            <div><span>me</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 34">
            <div><span>cä</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 35">
            <div><span>lu</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 36">
            <div><span>Sse</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 37">
            <div><span>brö</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 38">
            <div><span>ri</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 39">
            <div><span>fä</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 40">
            <div><span>no</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 41">
            <div><span>tu</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 42">
            <div><span>Uku</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 43">
            <div><span>chü</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 44">
            <div><span>hy</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 45">
            <div><span>pi</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 46">
            <div><span>gö</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 47">
            <div><span>si</span></div>
          </li>
          <li class="tagcloud-tag" style="--index: 48">
            <div><span>Gra</span></div>
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
  background: radial-gradient(var(--radial-15) 15%, var(--radial-65) 65%);
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
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  color: var(--text-head);
  text-decoration: none;
  font-weight: bold;
}
</style>
