Game.Hud = class Hud
{
    constructor()
    {
        this.game = null;
        this.dom = {};

        this.fillSpeed = 1;

        this.onAmmoChanged = this.onAmmoChanged.bind(this);
        this.onHealthChanged = this.onHealthChanged.bind(this);
        this.onWeaponEquip = this.onWeaponEquip.bind(this);
        this.onSceneCreate = this.onSceneCreate.bind(this);
        this.onSceneDestroy = this.onSceneDestroy.bind(this);

        this.currentWeapon = null;
    }
    attach(game, dom)
    {
        this.dom.hud = dom;
        this.dom.health = dom.querySelector('.health');
        this.dom.weapon = dom.querySelector('.weapon');
        this.dom.boss = dom.querySelector('.bossHealth');

        game.events.bind(game.EVENT_SCENE_CREATE, this.onSceneCreate);
        game.events.bind(game.EVENT_SCENE_DESTROY, this.onSceneDestroy);
        this.game = game;
    }
    detach()
    {
        this.dom = {};

        const game = this.game;
        game.events.unbind(game.EVENT_SCENE_CREATE, this.onSceneCreate);
        game.events.unbind(game.EVENT_SCENE_DESTROY, this.onSceneDestroy);
        this.game = null;
    }
    hideHud()
    {
        if (this.dom.hud) {
            this.dom.hud.classList.remove('visible');
        }
    }
    showHud()
    {
        if (this.dom.hud) {
            this.dom.hud.classList.add('visible');
        }
    }
    onAmmoChanged(ammo)
    {
        this.setAmountInteractive(this.dom.weapon, ammo.fraction);
    }
    onHealthChanged(health)
    {
        this.setAmountInteractive(this.dom.health, health.fraction);
    }
    onSceneCreate(scene)
    {
        if (scene instanceof Game.scenes.Level) {
            this.showHud();
            const player = scene.player.character;
            if (player) {
                player.events.bind(player.health.EVENT_HEALTH_CHANGED, this.onHealthChanged);
                player.events.bind(player.weapon.EVENT_EQUIP, this.onWeaponEquip);
            }
        }
    }
    onSceneDestroy(scene)
    {
        if (scene instanceof Game.scenes.Level) {
            this.hideHud();
            const player = scene.player.character;
            if (player) {
                player.events.unbind(player.health.EVENT_HEALTH_CHANGED, this.onHealthChanged);
                player.events.unbind(player.weapon.EVENT_EQUIP, this.onWeaponEquip);
            }
        }
    }
    onWeaponEquip(weapon)
    {
        const e = this.dom.weapon;
        if (this.currentWeapon) {
            const currentWeapon = this.currentWeapon;
            currentWeapon.events.unbind(currentWeapon.EVENT_AMMO_CHANGED, this.onAmmoChanged);
            e.classList.remove(currentWeapon.code);
        }
        e.classList.add(weapon.code);
        this.setAmount(this.dom.weapon, weapon.ammo.fraction);
        weapon.events.bind(weapon.EVENT_AMMO_CHANGED, this.onAmmoChanged);
        this.currentWeapon = weapon;
    }
    quantify(frac)
    {
        // Quantify to whole 1/28th increments.
        const s = 1 / 28;
        let q = frac - (frac % s);
        // Do not display empty unless completely empty.
        if (q === 0 && frac > 0) {
            q = s;
        }
        return q;
    }
    setAmount(element, frac)
    {
        element.querySelector('.amount').style.height = (this.quantify(frac) * 100) + '%';
        element.dataset.value = frac.toString();
    }
    setAmountInteractive(element, frac)
    {
        /* If energy should be increasing. */
        let current = parseFloat(element.dataset.value);
        if (frac > current) {
            const scene = this.game.scene;
            const timer = scene.timer;
            const target = frac;
            const speed = this.fillSpeed;
            const iteration = dt => {
                current += speed * dt;
                if (current >= target) {
                    current = target;
                    timer.events.unbind(timer.EVENT_TIMEPASS, iteration);
                    scene.resumeSimulation();
                }
                this.setAmount(element, current);
            }
            scene.pauseSimulation();
            timer.events.bind(timer.EVENT_TIMEPASS, iteration);
        } else {
            this.setAmount(element, frac);
        }
    }
}
