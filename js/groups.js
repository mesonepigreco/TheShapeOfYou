

export default class SpriteGroup {
    constructor() {
        this.sprites = [];
    }
    get length() {
        return this.sprites.length;
    }

    draw(context, camera) {
        for (var i = 0; i < this.sprites.length; ++i) {
            let sprite = this.sprites[i];
            sprite.draw(context, camera);
        }
    }

    update(deltaTime, camera) {
        for (var i = 0; i < this.sprites.length; ++i) {
            let sprite = this.sprites[i];
            sprite.update(deltaTime, camera);
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
}