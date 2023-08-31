<template>
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <div class="absolute inset-0 bg-gray-900 opacity-70"></div>
        <div class="relative bg-gray-800 ring ring-gray-800 shadow-xl px-2 pb-2 rounded-lg w-3/5">
            <div class="flex items-center justify-end py-2">
                <button id="subtitleOpenElement" @click="openSubtitleForm(selectedVideo.id)" class="bg-orange-400 hover:bg-orange-500 rounded-md px-1 text-sm my-0 py-0 mr-4 transition duration-500 transform hover:scale-105">
                    <i class="fa-solid fa-closed-captioning"></i> New Subtitle
                </button>
                <button class="text-gray-400 mr-0.5" @click="closeVideoPlayerModal">
                    <i class="fa-solid fa-circle-xmark fa-lg transition duration-500 transform hover:scale-125"></i>
                </button>
            </div>
            <div class="border-2 border-gray-700">
                <div id="videoElement" class="video-container">
                    <video id="video_id" :src="getAbsoluteUrl(selectedVideo.video_file)" crossorigin="anonymous" class="video-player" controls
                        preload="auto">
                        <track v-for="(subtitle, index) in selectedVideo.subtitle_files" :key="index"
                            :src="getAbsoluteUrl(subtitle.link)" :label="subtitle.language" :srclang="subtitle.code"
                            kind="subtitles">
                    </video>
                </div>
                <div v-if="showSubtitleForm" class="m-0.5 p-1 bg-gray-400 space-y-1.5">
                    <div class="flex flex-col">
                        <span class="w-full flex items-center bg-gray-600 p-1 rounded-md">
                            <label class="text-gray-200 font-semibold mr-1" for="name">Name</label>
                            <input placeholder="Enter subtitles file name.." class="rounded-md ml-1 w-full pl-4"
                                v-model="this.title" type="text" id="name">
                        </span>
                        <div v-if="errors.title" class="text-red-600 font-mono ml-2">
                            {{ errors.title[0] }}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="w-full flex items-center bg-gray-600 p-1 rounded-md">
                            <label class="text-gray-200 font-semibold" for="language">Language</label>
                            <select v-model="selectedLanguageIdForSubtitle"
                                class="w-full rounded-md ml-2.5 bg-gray-200 text-center p-0 text-gray-800">
                                <option v-for="language in languages" :key="language.id" :value="language.id">
                                    {{ language.name }}
                                </option>
                            </select>
                        </span>
                        <div v-if="errors.language" class="text-red-600 font-mono ml-2">
                            {{ errors.language[0] }}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <div class="flex items-center">
                            <span class="flex bg-gray-600 p-1 rounded-md">
                                <label class="text-gray-200 font-semibold" for="start_time">Start</label>
                                <input class="rounded-md ml-1" v-model="formData.start_time" type="time" id="start_time"
                                    step="0.001">
                            </span>
                            <span class="ml-2 flex bg-gray-600 p-1 rounded-md">
                                <label class="text-gray-200 font-semibold" for="start_time">End</label>
                                <input class="rounded-md ml-1" v-model="formData.end_time" type="time" id="end_time"
                                    step="0.001">
                            </span>
                        </div>
                        <div v-if="errors.subtitles" class="text-red-600 font-mono ml-2">
                            {{ errors.subtitles[0] }}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="w-full flex items-center bg-gray-600 p-1 rounded-md">
                            <label class="text-gray-200 font-semibold" for="text">Texts</label>
                            <input placeholder="Enter subtitles here.." class="rounded-md ml-2.5 w-full pl-4"
                                v-model="formData.text" type="text" id="text">
                        </span>
                        <div v-if="errors.text" class="text-red-600 font-mono ml-2">
                            {{ errors.title[0] }}
                        </div>
                        <!-- Validation Errors -->
                        <div v-if="subtitlesErrors.subtitleValidation" class="text-red-600 font-mono ml-2">
                            {{ subtitlesErrors.subtitleValidation }}
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button @click="addSubtitle"
                            class="px-4 py-1 bg-blue-500 rounded-lg text-sm text-white hover:bg-blue-700">
                            Add more
                        </button>
                        <button @click="saveSubtitles"
                            class="ml-4 px-4 py-1 bg-green-600 rounded-lg text-sm text-white hover:bg-green-700">
                            Create file
                        </button>
                        <button @click="closeSubtitleForm"
                            class="ml-4 px-4 py-1 bg-red-500 rounded-lg text-sm text-white hover:bg-red-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { getAbsoluteUrl } from '../utils';


export default {
    props: {
        selectedVideo: Object,
    },
    data() {
        return {
            languages: [],
            showSubtitleForm: false,
            selectedVideoIdForSubtitle: null,
            selectedLanguageIdForSubtitle: null,
            formData: {
                start_time: '00:00:00.000',
                end_time: '00:00:00.000',
                text: '',
            },
            title: '',
            subtitles: [],
            errors: {},

            // Add a field to track validation errors
            subtitlesErrors: {
                subtitleValidation: null,
            },
        };
    },
    methods: {
        getAbsoluteUrl,

        // Create subtitle
        openSubtitleForm(videoId) {
            this.fetchLanguages();
            this.selectedVideoIdForSubtitle = videoId;
            this.showSubtitleForm = true;

            // Update the padding-bottom property using inline style
            var subtitleOpenElement = document.getElementById("subtitleOpenElement");
            var element = document.getElementById("videoElement");

            subtitleOpenElement.classList.add("hidden");
            element.style.paddingBottom = "35.00%";
        },

        // Video upload form
        handleSubtitleCreated(subtitleItem) {
            this.showSubtitleForm = false;
            this.selectedVideo.subtitle_files.push(subtitleItem);
        },

        closeSubtitleForm() {
            this.selectedVideoIdForSubtitle = null;
            this.selectedLanguageIdForSubtitle = null;
            this.showSubtitleForm = false;
            this.title = '',
            this.subtitles = [],
            this.formData = {
                start_time: '00:00:00.000',
                end_time: '00:00:00.000',
                text: '',
            };

            // Update the padding-bottom property using inline style
            var openElement = document.getElementById("subtitleOpenElement");
            var element = document.getElementById("videoElement");
            
            openElement.classList.remove("hidden")
            element.style.paddingBottom = "56.25%"; /* 16:9 aspect ratio */
        },
        // Fetch languages
        async fetchLanguages() {
            try {
                const response = await axios.get(getAbsoluteUrl("languages"));
                this.languages = response.data.data;
            } catch (error) {
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

        addSubtitle() {
            // Validate subtitle before adding
            if (!this.validateSubtitle()) {
                // Display the validation error message
                this.subtitlesErrors.subtitleValidation = validationResult.errorMessage;

                // Validation failed, do not proceed
                return;
            }
            this.subtitlesErrors.subtitleValidation = null;
            this.subtitles.push({
                start_time: this.formData.start_time.toString(),
                end_time: this.formData.end_time.toString(),
                text: this.formData.text,
            });

            // Clear form data after adding subtitle
            this.formData = {
                start_time: this.formData.end_time,
                end_time: '00:00:00.000',
                text: '',
            };
            this.title = this.title
        },
        validateSubtitle() {
            const { start_time, end_time, text } = this.formData;

            if (!text) {
                this.subtitlesErrors.subtitleValidation = 'Text can not be blank';
                return false;
            }

            if (start_time >= end_time) {
                this.subtitlesErrors.subtitleValidation = 'End time must be after start time';
                return false;
            }

            const lastSubtitle = this.subtitles[this.subtitles.length - 1];
            if (lastSubtitle && start_time < lastSubtitle.end_time) {
                this.subtitlesErrors.subtitleValidation = 'Subtitle time ranges cannot overlap';
                return false;
            }

            // If all validations pass
            this.subtitlesErrors.subtitleValidation = null;
            return true;
        },
        async saveSubtitles() {
            const subtitleData = {
                title: this.title,
                video: this.selectedVideoIdForSubtitle,
                language: this.selectedLanguageIdForSubtitle,
                subtitles: this.subtitles,
            };
            try {
                // Send subtitleData to your API
                const response = await axios.post(getAbsoluteUrl("subtitles"), subtitleData);

                const language = this.languages.find(lang => lang.id === this.selectedLanguageIdForSubtitle);

                // Clear form data after saving
                this.subtitles = [];
                this.selectedLanguageIdForSubtitle = null;
                this.title = '';
                this.formData = {
                    start_time: '00:00:00.000',
                    end_time: '00:00:00.000',
                    text: '',
                };

                // Close the subtitle form and update subtitle in video list
                this.handleSubtitleCreated({
                    "id": response.data.id,
                    "language": language.name,
                    "link": response.data.file,
                    "code": language.code
                });
            } catch (error) {
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

        closeVideoPlayerModal() {
            this.$emit('close');
        }
    },
};
</script>

<style scoped>
.video-container {
    position: relative;
    height: 0;
    padding-bottom: 56.25%;
    overflow: hidden;
}

#video_id::cue {
    font-family: "Times New Roman", cursive;
}

.video-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
