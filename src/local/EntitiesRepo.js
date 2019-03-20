import JsonApiEntity from './JsonApiEntity';

function payloadEntities(payload) {
  const accumulator = [];

  if (payload.data) {
    if (Array.isArray(payload.data)) {
      accumulator.push(...payload.data);
    } else {
      accumulator.push(payload.data);
    }
  }

  if (payload.included) {
    accumulator.push(...payload.included);
  }

  return accumulator;
}

export default class EntitiesRepo {
  constructor(...payloads) {
    this.entities = {};
    this.upsertEntities(...payloads);
  }

  upsertEntities(...payloads) {
    payloads.forEach((payload) => {
      payloadEntities(payload).forEach((entityPayload) => {
        const object = new JsonApiEntity(entityPayload, this);
        this.entities[object.type] = this.entities[object.type] || {};
        this.entities[object.type][object.id] = object;
      });
    });
  }

  destroyEntities(type, ids) {
    ids.forEach((id) => {
      delete this.entities[type][id];
    });
  }

  destroyItemType(id) {
    const itemIds = Object.values(this.entitiesRepo.entities.item)
      .filter(item => item.itemType.id === id)
      .map(item => item.id);

    this.entitiesRepo.destroyEntities('item', itemIds);
    this.entitiesRepo.destroyEntities('item_type', [id]);
  }

  findEntitiesOfType(type) {
    return Object.values(this.entities[type] || {});
  }

  findEntity(type, id) {
    return this.entities[type] && this.entities[type][id];
  }
}
