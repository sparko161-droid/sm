export default {
  name: "operations",

  async init(container) {
    container.innerHTML = `
      <section class="page page--operations">
        <h1>Operations</h1>
        <p>Здесь позже будет контент operations из оригинального проекта.</p>
      </section>
    `;
  },

  destroy() {}
};
