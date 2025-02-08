import 'reflect-metadata';

class DiContainer {
  private static instance: DiContainer;
  private services: Map<string, any> = new Map<string, any>();

  private constructor() {}

  static getInstance(): DiContainer {
    if (!DiContainer.instance) {
      DiContainer.instance = new DiContainer();
    }
    return DiContainer.instance;
  }

  register(name: string, service: any) {
    this.services.set(name, service);
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }

    if (typeof service === 'function' && !service.prototype) {
      return service();
    }

    if (typeof service === 'function') {
      const dependencies = this.getDependencies(service);
      return new service(...dependencies);
    }

    return service;
  }

  private getDependencies(service: any): any[] {
    const dependencies =
      Reflect.getMetadata('design:paramtypes', service) || [];
    return dependencies.map((dependency: any) => this.resolve(dependency.name));
  }
}

export const container = DiContainer.getInstance();
