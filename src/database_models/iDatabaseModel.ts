export interface iDatabaseModel {
    GetTopLevelKey: () => string;
    BuildKey: (id: string, modifiedRoot: string) => string;
}
