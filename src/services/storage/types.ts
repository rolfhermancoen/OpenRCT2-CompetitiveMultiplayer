export type StorageType = "park" | "shared";

export type StorageOptions<T> = {
  name: string;
  type?: StorageType;
  initialData?: Collection<T>;
};

export type Value<T> = T;
export type ValueObject<T> = { [key: string]: T };
export type CollectionValue<T> = { key: string; value: Value<T> };
export type Collection<T> = Array<CollectionValue<T>>;
