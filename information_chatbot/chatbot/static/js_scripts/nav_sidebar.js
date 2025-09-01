class NavSideBar {
    constructor() {
        this.sideBar = document.getElementById('navSidebar');
        this.navToggle = document.getElementById('navToggle');

        this.init();
    }
    
    init() {
        this.initNavToggleListener();
    }

    initNavToggleListener() {
        this.setOpen(true);
        this.navToggle.addEventListener('click', () => {
            this.setOpen(!this.sideBar.classList.contains('open'));
        });
    }

    setOpen(open) {
        if (open) {
            this.sideBar.classList.add('open');
        } else {
            this.sideBar.classList.remove('open');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.NavSideBar = new NavSideBar();
});
