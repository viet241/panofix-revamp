export interface ExtractedXmpMetadata {
    fullPanoWidth: number;
    fullPanoHeight: number;
    croppedWidth: number;
    croppedHeight: number;
    croppedLeft?: number;
    croppedTop?: number;
    posePitchDegrees?: number;
}

export interface InjectXmpOptions {
    fullPanoWidth: number;
    fullPanoHeight: number;
    croppedWidth: number;
    croppedHeight: number;
    croppedLeft: number;
    croppedTop: number;
    posePitchDegrees?: number;
}

export interface ViewFromMetadata {
    hDegrees: number;
    vDegrees: number;
    northOffset: number;
    horizonOffset: number;
}

/**
 * Insert XMP metadata into JPEG buffer.
 */
export function injectXMP(buffer: ArrayBuffer, metadata: InjectXmpOptions): ArrayBuffer {
    const xmpNamespace = "http://ns.adobe.com/xap/1.0/\0";
    const xmpContent = `
    <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003">
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">
          <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
          <GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>
          <GPano:FullPanoWidthPixels>${metadata.fullPanoWidth}</GPano:FullPanoWidthPixels>
          <GPano:FullPanoHeightPixels>${metadata.fullPanoHeight}</GPano:FullPanoHeightPixels>
          <GPano:CroppedAreaImageWidthPixels>${metadata.croppedWidth}</GPano:CroppedAreaImageWidthPixels>
          <GPano:CroppedAreaImageHeightPixels>${metadata.croppedHeight}</GPano:CroppedAreaImageHeightPixels>
          <GPano:CroppedAreaLeftPixels>${metadata.croppedLeft}</GPano:CroppedAreaLeftPixels>
          <GPano:CroppedAreaTopPixels>${metadata.croppedTop}</GPano:CroppedAreaTopPixels>
          ${typeof metadata.posePitchDegrees === "number"
                ? `<GPano:PosePitchDegrees>${metadata.posePitchDegrees.toFixed(2)}</GPano:PosePitchDegrees>
          <GPano:InitialViewPitchDegrees>${metadata.posePitchDegrees.toFixed(2)}</GPano:InitialViewPitchDegrees>`
                : ""}
        </rdf:Description>
      </rdf:RDF>
    </x:xmpmeta>
  `.trim();

    const xmpData = new TextEncoder().encode(xmpNamespace + xmpContent);
    const view = new DataView(buffer);

    if (view.getUint16(0) !== 0xffd8) {
        throw new Error("Not a valid JPEG file");
    }

    const segmentHeader = new Uint8Array([0xff, 0xe1]);
    const length = xmpData.length + 2;
    const lengthBytes = new Uint8Array([(length >> 8) & 0xff, length & 0xff]);

    const newBuffer = new Uint8Array(buffer.byteLength + 2 + 2 + xmpData.length);
    newBuffer.set(new Uint8Array(buffer.slice(0, 2)), 0);
    newBuffer.set(segmentHeader, 2);
    newBuffer.set(lengthBytes, 4);
    newBuffer.set(xmpData, 6);
    newBuffer.set(new Uint8Array(buffer.slice(2)), 6 + xmpData.length);

    return newBuffer.buffer;
}

/**
 * Extract XMP panorama metadata from an image buffer.
 */
export function extractXMP(buffer: ArrayBuffer): ExtractedXmpMetadata | null {
    const decoder = new TextDecoder("utf-8");
    const view = new Uint8Array(buffer.slice(0, 128 * 1024));
    const content = decoder.decode(view);

    const getIntTagValue = (tag: string): number | null => {
        const regex = new RegExp(`<GPano:${tag}>(\\d+)</GPano:${tag}>`, "i");
        const match = content.match(regex);
        if (match) return parseInt(match[1], 10);
        const attrRegex = new RegExp(`GPano:${tag}="(\\d+)"`, "i");
        const attrMatch = content.match(attrRegex);
        return attrMatch ? parseInt(attrMatch[1], 10) : null;
    };

    const getFloatTagValue = (tag: string): number | null => {
        const regex = new RegExp(`<GPano:${tag}>([-\\d.]+)</GPano:${tag}>`, "i");
        const match = content.match(regex);
        if (match) return parseFloat(match[1]);
        const attrRegex = new RegExp(`GPano:${tag}="([-\\d.]+)"`, "i");
        const attrMatch = content.match(attrRegex);
        return attrMatch ? parseFloat(attrMatch[1]) : null;
    };

    const fullPanoWidth = getIntTagValue("FullPanoWidthPixels");
    const fullPanoHeight = getIntTagValue("FullPanoHeightPixels");
    const croppedWidth = getIntTagValue("CroppedAreaImageWidthPixels");
    const croppedHeight = getIntTagValue("CroppedAreaImageHeightPixels");
    const croppedLeft = getIntTagValue("CroppedAreaLeftPixels") ?? undefined;
    const croppedTop = getIntTagValue("CroppedAreaTopPixels") ?? undefined;

    const posePitch = getFloatTagValue("PosePitchDegrees");
    const initialPitch = getFloatTagValue("InitialViewPitchDegrees");
    const posePitchDegrees = (posePitch ?? initialPitch) ?? undefined;

    if (posePitchDegrees !== undefined) {
        console.log("[XMP] Parsed PosePitchDegrees / InitialViewPitchDegrees:", posePitchDegrees);
    } else {
        console.log("[XMP] No PosePitchDegrees/InitialViewPitchDegrees found in XMP");
    }

    if (fullPanoWidth && fullPanoHeight && croppedWidth && croppedHeight) {
        console.log("[XMP] Geometry tags:", {
            fullPanoWidth,
            fullPanoHeight,
            croppedWidth,
            croppedHeight,
            croppedLeft,
            croppedTop,
        });
        return {
            fullPanoWidth,
            fullPanoHeight,
            croppedWidth,
            croppedHeight,
            croppedLeft,
            croppedTop,
            posePitchDegrees,
        };
    }
    return null;
}

/**
 * Compute UI view state (FOV, North, Horizon) from GPano metadata.
 */
export function computeViewFromMetadata(
    metadata: ExtractedXmpMetadata,
    imageWidth: number,
    imageHeight: number,
): ViewFromMetadata {
    console.log("[ViewFromMetadata] Input metadata:", metadata, "imageSize:", {
        imageWidth,
        imageHeight,
    });

    const hDegrees = Math.round((metadata.croppedWidth / metadata.fullPanoWidth) * 360);
    const vDegrees = Math.round((metadata.croppedHeight / metadata.fullPanoHeight) * 180);

    let northOffset = 0;
    if (typeof metadata.croppedLeft === "number") {
        const croppedLeftDegrees = (metadata.croppedLeft / metadata.fullPanoWidth) * 360;
        const leftEdgeRelToNorth = ((croppedLeftDegrees - 180 + 540) % 360) - 180;
        northOffset = -(leftEdgeRelToNorth + hDegrees / 2);
    }

    let horizonOffset = 0;
    if (typeof metadata.croppedTop === "number") {
        // CroppedAreaTopPixels is the primary source for horizon position.
        // centerTop = image centered on equator; offset from that = horizon shift.
        const centerTop = (metadata.fullPanoHeight - imageHeight) / 2;
        const shiftPixels = metadata.croppedTop - centerTop;
        horizonOffset = -shiftPixels * (180 / metadata.fullPanoHeight);
    } else if (typeof metadata.posePitchDegrees === "number") {
        horizonOffset = metadata.posePitchDegrees;
    }

    console.log("[ViewFromMetadata] Computed view:", {
        hDegrees,
        vDegrees,
        northOffset,
        horizonOffset,
    });

    return {
        hDegrees,
        vDegrees,
        northOffset,
        horizonOffset,
    };
}

