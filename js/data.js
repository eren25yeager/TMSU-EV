// ==========================================================================
// Data Management System
// ==========================================================================

import { Utils } from './utils.js';

export class DataManager {
    constructor() {
        this.csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiyP0D5X-WL8IPT4UMNgO5QFYruJIPaKpHLGD8Wl1PdUcJcefMMOzERSSKyT54AENHkpMdwaOzD3Ik/pub?output=csv';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async fetchMemberData(memberCode) {
        const validation = Utils.validateMemberCode(memberCode);
        if (!validation.isValid) {
            throw new Error('Invalid member code format');
        }

        const cacheKey = validation.sanitized.toLowerCase();
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        // Fetch with retry mechanism
        const data = await Utils.retryOperation(async () => {
            return new Promise((resolve, reject) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    reject(new Error('Request timeout'));
                }, 10000); // 10 second timeout

                Papa.parse(this.csvUrl, {
                    download: true,
                    header: true,
                    skipEmptyLines: true,
                    signal: controller.signal,
                    complete: (results) => {
                        clearTimeout(timeoutId);
                        
                        if (results.errors.length > 0) {
                            reject(new Error('Data parsing error'));
                            return;
                        }

                        const memberData = results.data.find(row => 
                            row.Code && row.Code.trim().toLowerCase() === cacheKey
                        );

                        if (memberData) {
                            // Cache the result
                            this.cache.set(cacheKey, {
                                data: memberData,
                                timestamp: Date.now()
                            });
                            resolve(memberData);
                        } else {
                            reject(new Error('Member not found'));
                        }
                    },
                    error: (error) => {
                        clearTimeout(timeoutId);
                        reject(new Error('Network error'));
                    }
                });
            });
        }, 3, 1000);

        return data;
    }

    processPhotoUrl(photoUrl) {
        if (!photoUrl) return 'images/default-avatar.png';
        
        if (photoUrl.includes('drive.google.com')) {
            const fileId = new URL(photoUrl).searchParams.get('id');
            if (fileId) {
                return `https://lh3.googleusercontent.com/d/${fileId}=s220`;
            }
        }
        
        return photoUrl;
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}