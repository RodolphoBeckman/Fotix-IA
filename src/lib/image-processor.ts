export type Dimension = {
  name: string;
  width: number;
  height: number;
};

export type ProcessedImage = {
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
};

export async function processImage(
  file: File,
  dimensions: Dimension[]
): Promise<ProcessedImage[]> {
  const imageBitmap = await createImageBitmap(file);

  const processedImages = await Promise.all(
    dimensions.map(async (dim) => {
      const canvas = document.createElement('canvas');
      canvas.width = dim.width;
      canvas.height = dim.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Não foi possível obter o contexto do canvas');
      }

      const imgAspectRatio = imageBitmap.width / imageBitmap.height;
      const canvasAspectRatio = dim.width / dim.height;

      let renderWidth, renderHeight, x, y;

      if (imgAspectRatio > canvasAspectRatio) {
        renderHeight = dim.height;
        renderWidth = renderHeight * imgAspectRatio;
        x = (dim.width - renderWidth) / 2;
        y = 0;
      } else {
        renderWidth = dim.width;
        renderHeight = renderWidth / imgAspectRatio;
        x = 0;
        y = (dim.height - renderHeight) / 2;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, dim.width, dim.height);
      ctx.drawImage(imageBitmap, x, y, renderWidth, renderHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      if (!blob) {
        throw new Error('Falha ao criar blob a partir do canvas');
      }

      const url = URL.createObjectURL(blob);
      const originalFileName = file.name.substring(
        0,
        file.name.lastIndexOf('.')
      );
      const newFileName = `${originalFileName}_${dim.width}x${dim.height}.jpg`;

      return {
        url,
        name: newFileName,
        size: blob.size,
        width: dim.width,
        height: dim.height,
      };
    })
  );

  return processedImages;
}
