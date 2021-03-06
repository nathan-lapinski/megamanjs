'use strict';

Engine.Tween = class Tween
{
    constructor(to, easing = Engine.Easing.linear)
    {
        this._keys = Object.keys(to).filter(key => to[key] != null);
        this._to = to;
        this._easing = easing;
        this._subjects = [];
    }
    _updateOrigin(subject)
    {
        this._keys.forEach(key => {
            subject.origin[key] = subject.object[key];
        });
    }
    addSubject(object)
    {
        const subject = {
            object,
            origin: {},
        };
        this._updateOrigin(subject);
        this._subjects.push(subject);
    }
    refresh()
    {
        this._subjects.forEach(subject => {
            this._updateOrigin(subject);
        });
    }
    update(progress)
    {
        const to = this._to;
        const f = this._easing(progress);
        this._subjects.forEach(subject => {
            const origin = subject.origin;
            this._keys.forEach(key => {
                subject.object[key] = origin[key] + (to[key] - origin[key]) * f;
            });
        });
    }
}
