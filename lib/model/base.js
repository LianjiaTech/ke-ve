module.exports = class DB {
  constructor(db) {
    this.db = db;
  }

  add(data) {
    if (data.id) {
      return this.db
        .get('data')
        .push(data)
        .write();
    } else {
      return this.db
        .get('data')
        .insert(data)
        .write();
    }
  }

  delete(data) {
    return this.db
      .get('data')
      .remove(data)
      .write();
  }

  update(query, data) {
    return this.db
      .get('data')
      .find(query)
      .assign(data)
      .write();
  }

  get(query) {
    let res = this.db
      .get('data')
      .find(query)
      .value();
    if (!res) return res;
    return Object.assign({}, res);
  }

  getAll(query) {
    let res;
    if (query) {
      res = this.db
        .get('data')
        .filter(query)
        .value();
    } else {
      res = this.db.get('data').value();
    }
    if (!res) return res;
    return JSON.parse(JSON.stringify(res));
  }

  getOrAdd(query) {
    let data = this.db
      .get('data')
      .find(query)
      .value();
    if (data) {
      return data;
    } else {
      return this.db
        .get('data')
        .insert(query)
        .write();
    }
  }

  reset() {
    return this.db.set('data', []).write();
  }
};
