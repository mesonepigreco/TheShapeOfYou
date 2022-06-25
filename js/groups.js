

export default class SpriteGroup {
    constructor() {
        this.sprites = [];
    }
    get length() {
        return this.sprites.length;
    }

    draw(context, camera) { 
        // Sort the sprites
        function sorting_rules(a,b) {
            if (a.kind === "stream") return 1;
            if (b.kind === "stream") return -1;

            if (a.kind === "player") return 1;
            if (b.kind === "player") return -1;

            if (a.kind === "target") return 1;
            if (b.kind === "target") return -1;
            return 0;
        }
        this.sprites.sort(sorting_rules);

        for (var i = 0; i < this.sprites.length; ++i) {
            let sprite = this.sprites[i];
            sprite.draw(context, camera);
        }
    }

    update(deltaTime, camera, collisions, perimeter, streams) {
        for (var i = 0; i < this.sprites.length; ++i) {
            let sprite = this.sprites[i];
            sprite.update(deltaTime, camera, collisions, perimeter, streams);
        }
    }

    add(sprite) {
        this.sprites.push(sprite);
        sprite.groups.push(this);
    }

    remove(sprite) {
        // Remove the sprite from the group
        var index = this.sprites.findIndex( (element) => element == sprite);
        this.sprites.splice(index, 1);
        
        // Remove the group from the sprite groups
        var index = sprite.groups.findIndex( (element) => element == this);
        sprite.groups.splice(index, 1);

    }

    // Remove all the sprites
    empty() {
        for (var i = this.length - 1; i >= 0; --i) {
            this.remove(this.sprites[i]);
        }
    }
}