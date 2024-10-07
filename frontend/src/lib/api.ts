import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function signXml(pfxFile: File, passphrase: string, xmlText: string) {
  const formData = new FormData();
  formData.append('pfx', pfxFile);
  formData.append('passphrase', passphrase);
  formData.append('xml', xmlText);

  try {
    const response = await axios.post(`${API_BASE_URL}/sign`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error signing XML:', error);
    throw error;
  }
}

export function getDownloadUrl(signedXmlPath: string): string {
  return `${API_BASE_URL}/sign/download?path=${encodeURIComponent(signedXmlPath)}`;
}