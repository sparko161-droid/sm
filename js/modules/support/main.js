export default {
  name: "support",

  async init(container) {
    container.innerHTML = `
      <section class="page page--support">
        <h1>Support</h1>
        <p>Здесь позже будет контент support из оригинального проекта.</p>
      </section>
    `;
  },

  destroy() {}
};
