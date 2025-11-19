export default {
  name: "implementation",

  async init(container) {
    container.innerHTML = `
      <section class="page page--implementation">
        <h1>Implementation</h1>
        <p>Здесь позже будет контент implementation из оригинального проекта.</p>
      </section>
    `;
  },

  destroy() {}
};
