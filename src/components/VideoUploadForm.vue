<template>
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <div class="relative bg-gray-200 ring ring-gray-400 shadow-xl px-8 pt-2 pb-4 rounded-lg w-3/5">
            <div class="p-4 bg-blue-400 text-white font-bold text-lg font-mono mb-4 rounded-md text-center">
                Upload video
            </div>
            <form @submit.prevent="uploadVideo" enctype="multipart/form-data">
                <div class="bg-gray-300 border border-gray-900 rounded-md text-lg mb-4 font-mono">
                    <input placeholder="Enter video title here..." class="w-full font-mono rounded-md p-4" v-model="formData.title" type="text" id="title">
                    <div v-if="errors.title" class="text-red-600 font-mono">
                        {{ errors.title[0] }}
                    </div>
                </div>
                <div class="bg-gray-300 p-4 rounded-md font-mono">
                    <label for="video_file">Video file</label>
                    <input type="file" accept="video/*" @change="handleFileChange">
                    <div v-if="errors.video_file" class="text-red-600 font-mono pl-4">
                        {{ errors.video_file[0] }}
                    </div>
                </div>
                <button type="submit" :disabled="isUploading"
                    class="w-full mt-4 py-1.5 bg-green-500 rounded-lg text-white hover:bg-green-600">
                    
                    <span v-if="isUploading">
                        Uploading Video <i  class="fa-solid fa-spinner fa-spin-pulse fa-lg"></i>
                    </span>
                    <span v-else>
                        Upload Video <i  class="fa-solid fa-upload"></i>
                    </span>                    
                </button>
            </form>
            <button @click="closeUploadForm" class="w-full mt-2 py-1.5 bg-red-500 rounded-lg text-white hover:bg-red-700">
                Cancel
            </button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { getAbsoluteUrl } from '../utils';

export default {
    data() {
        return {
            formData: {
                title: '',
                video_file: null,
            },
            errors: {},
            isUploading: false,
        };
    },
    methods: {
        getAbsoluteUrl,

        handleFileChange(event) {
            this.formData.video_file = event.target.files[0];
        },

        async uploadVideo() {
            // Clear previous errors
            this.errors = {};
            this.isUploading = true; // Show loading spinner during submission

            try {
                const formData = new FormData();
                formData.append('title', this.formData.title);
                formData.append('video_file', this.formData.video_file);

                const response = await axios.post(getAbsoluteUrl("/api/videos/"), this.formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                });
                // Reset upload state when submission is complete
                this.isUploading = false;

                // Emit the uploaded video and reset form data
                this.$emit('videoUploaded', response.data);
                this.formData.title = '';
                this.formData.video_file = null;
            } catch (error) {
                this.isUploading = false; // Handle error and hide loading spinner
                if (error.response) {
                    // Handle API validation errors
                    if (error.response.status === 422) {
                        this.errors = error.response.data.data.message;
                    } else {
                        // Handle other API errors
                        console.error('API Error:', error.response.data.message);
                    }
                } else {
                    // Handle network errors or other issues
                    console.error('Request Error:', error.message);
                }
            }
        },
        
        closeUploadForm() {
            this.$emit('close');
        },
    },
};
</script>
