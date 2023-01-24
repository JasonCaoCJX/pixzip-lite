import { useRef, DragEvent, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { filesAtom } from "@/stores/file";
import { currentSpaceIdAtom } from "@/stores/space";
import produce from "immer";

const isImage = (type: string): boolean => {
  const imgTypes =
    "image/avif,image/gif,image/jpeg,image/png,image/tiff,image/webp";

  return imgTypes.includes(type);
};

type TheFile = File & { path: string };

export const useAddFile = () => {
  const [files, setFiles] = useAtom(filesAtom);
  const currentSpaceId = useAtomValue(currentSpaceIdAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (theFiles: TheFile[]) => {
    const data: SendFile[] = [];

    for (const file of theFiles) {
      if (
        isImage(file.type) &&
        files.find((element) => element.path === file.path) === undefined
      ) {
        const temp: SendFile = {
          path: file.path,
          name: file.name,
          type: file.type,
          status: "waiting",
          originalSize: file.size,
          spaceId: currentSpaceId,
        };
        data.push(temp);
      }
    }

    const nextState = produce(files, (draft) => {
      draft.push(...data);
    });
    setFiles(nextState);
    window.lossApi["file:add"](data);
  };

  const handleInputAddFile = () => {
    const files = inputRef.current?.files;
    if (!files) return;
    // addFiles(files);
    // TODO
  };

  const handleDragFile = (evt: DragEvent<HTMLDivElement>) => {
    const files = evt.dataTransfer.files;
    addFiles(files as unknown as TheFile[]);
  };

  const reCompress = () => {
    if (files.length) {
      window.lossApi["file:add"](files);
    }
  };

  useEffect(() => {
    window.lossApi["compress:success"]((_: unknown, file: SendFile) => {
      setFiles((prevState) => {
        const nextState = produce(prevState, (draft) => {
          const index = draft.findIndex(
            (element) => element.path === file.path
          );
          if (index > -1) {
            draft[index].status = file.status;

            if (file.status === "success") {
              draft[index].compressedSize = file.compressedSize;
              draft[index].outputPath = file.outputPath;
            }
          }
        });

        return nextState;
      });
    });
  }, []);

  return {
    files,
    inputRef,
    handleInputAddFile,
    handleDragFile,
    reCompress,
  };
};
