export interface iDatabaseModel {
    GetTopLevelKey: () => string;
    BuildKey: (id: string) => string;
}
