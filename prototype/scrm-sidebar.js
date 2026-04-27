(function () {
  const menuGroups = [
    {
      title: null,
      groups: [
        {
          key: "customer",
          label: "客户",
          items: [
            { key: "customer-list", label: "客户管理", href: "客户管理-交付扩展.html" },
            { key: "tag-management", label: "标签管理", href: "标签管理.html" }
          ]
        },
        {
          key: "reach",
          label: "触达",
          items: [
            { key: "sales-touch", label: "群发/私戳", href: "销售触达一期.html" }
          ]
        },
        {
          key: "marketing",
          label: "营销",
          items: [
            { key: "segment-management", label: "人群包管理", href: "人群包管理.html" },
            { key: "automation-tags", label: "自动化标签", href: "自动化标签管理.html" },
            { key: "distribution-ranking", label: "分销排行榜", href: "分销排行榜-后台.html" }
          ]
        },
        {
          key: "data",
          label: "数据",
          items: [
            { key: "sales-warning", label: "销售运营看板", href: "销售运营过程监控与预警.html" }
          ]
        }
      ],
      standalone: [
        { key: "home", label: "首页", href: "#" }
      ]
    }
  ];

  function renderMenuGroup(group, currentKey) {
    const hasActiveChild = group.items.some((item) => item.key === currentKey);
    const subItems = group.items
      .map((item) => {
        const activeClass = item.key === currentKey ? " active" : "";
        return '<a class="menu-item' + activeClass + '" href="' + item.href + '" style="text-decoration:none;">' + item.label + "</a>";
      })
      .join("");

    return (
      '<div class="menu-group open">' +
      '<div class="menu-item menu-group-trigger' +
      (hasActiveChild ? " parent-active" : "") +
      '">' +
      "<span>" +
      group.label +
      '</span><span class="arrow">&#8250;</span></div>' +
      '<div class="menu-sub">' +
      subItems +
      "</div></div>"
    );
  }

  function renderStandalone(item, currentKey) {
    const activeClass = item.key === currentKey ? " active" : "";
    const meta = item.meta ? "<small>" + item.meta + "</small>" : "";
    return (
      '<a class="menu-item' + activeClass + '" href="' + item.href + '" style="text-decoration:none;">' +
      "<span>" +
      item.label +
      "</span>" +
      meta +
      "</a>"
    );
  }

  function buildSidebar(currentKey) {
    const sections = menuGroups
      .map((section) => {
        const groupsHtml = section.groups.map((group) => renderMenuGroup(group, currentKey)).join("");
        const standaloneHtml = (section.standalone || [])
          .map((item) => renderStandalone(item, currentKey))
          .join("");

        return (
          (section.title
            ? '<div class="menu-group-title">' + section.title + "</div>"
            : "") +
          standaloneHtml +
          groupsHtml +
          ""
        );
      })
      .join("");

    return (
      '<div class="sidebar-logo">SCRM</div>' +
      '<div class="sidebar-menu">' +
      sections +
      "</div>"
    );
  }

  function bindSidebarEvents(root) {
    root.querySelectorAll(".menu-group-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const group = trigger.parentElement;
        group.classList.toggle("open");
      });
    });
  }

  window.renderSCRMPrototypeSidebar = function renderSCRMPrototypeSidebar(target, currentKey) {
    const container = typeof target === "string" ? document.getElementById(target) : target;
    if (!container) return;
    container.innerHTML = buildSidebar(currentKey);
    bindSidebarEvents(container);
  };
})();
