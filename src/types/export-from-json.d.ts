
declare global {
  interface Window {
    exportFromJSON: (options: {
      data: any[] | string;
      fileName?: string;
      exportType?: "txt" | "csv" | "xls" | "json" | "html" | "css" | "xml";
      withBOM?: boolean;
      delimiter?: "," | ";";
      beforeTableEncode?: (
        entries: { fieldName: string; fieldValues: string[] }[]
      ) => { fieldName: string; fieldValues: string[] }[];
      fields?: string[] | Record<string, string>;
      processor?: (content: string, type: string, fileName: string) => any;
    }) => void;
  }
}

export {};
