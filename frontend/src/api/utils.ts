/**
 * 統一處理 API 回應
 */
export async function handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.status}`);
        }
        return data;
    }

    const text = await response.text();
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${text.substring(0, 100)}`);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        // 如果不是 JSON 且回應 OK，回傳原始文字
        return text;
    }
}
