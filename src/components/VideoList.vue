<template>
    <div class="bg-gray-900 min-h-screen">
        <!-- Header -->
        <header class="flex items-center justify-between">
            <span
                class="text-red-800 py-4 sm:py-6 md:py-8 lg:py-10 font sm:p ml-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">
                <i class="fa-solid fa-film fa-2xl"></i> <i class="fa-solid fa-closed-captioning fa-md fa-spin "></i>
                <span class="ml-1 uppercase">Video media</span>
            </span>
            <button @click="openUploadForm"
                class="mr-10 px-3 py-1 bg-blue-700 rounded-lg text-sm text-gray-100 hover:bg-blue-800 transition duration-500 transform hover:scale-110">
                Upload Video <i class="fa-solid fa-upload"></i>
            </button>
        </header>

        <!-- Video list -->
        <section class="relative sm:px-9 lg:px-18 bg-gray-900">
            <table class="w-full">
                <thead>
                    <tr class="border-y border-gray-700 text-gray-200 text-md uppercase">
                        <th class="text-left px-6 py-2 w-2/3">
                            Videos
                        </th>
                        <th class="text-center px-6 py-2 w-1/3">
                            Subtitles
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-gray-800 text-center">
                    <tr v-for="video in videos" :key="video.id" class="text-white border-b-8 border-gray-900">
                        <th>
                            <div class="py-4 flex items-center justify-between">
                                <div class="flex items-center">
                                    <button @click="openVideoPlayerModal(video)"
                                        class="ml-8 fa-regular fa-circle-play fa-2xl transition duration-200 transform scale-125 hover:scale-150 cursor-pointer">
                                    </button>
                                    <div class="ml-4 md:ml-8 mr-4 md:mr-8 text-left">
                                        <div class="line-clamp-1 capitalize">
                                            {{ video.title }}
                                        </div>
                                        <div class="text-gray-400 text-xs">
                                            <i class="fa-solid fa-calendar-day"></i> {{ video.upload_date }}
                                        </div>
                                    </div>
                                </div>
                                <button @click="confirmVideoDelete(video.id)"
                                    class="px-3 py-1 m-1 mr-3 bg-red-500 rounded-lg text-xs sm:text-sm md:text-md font-semibold transition duration-200 transform hover:scale-105">
                                    <i class="fas fa-trash"></i> Delete video
                                </button>
                            </div>
                        </th>
                        <td>
                            <button @click="confirmSubtitleDelete(video.id, subtitle.id)"
                                v-for="(subtitle, index) in video.subtitle_files" :key="index"
                                class="px-3 py-1 m-1 mr-3 bg-red-500 rounded-lg text-xs sm:text-sm md:text-md font-semibold transition duration-200 transform hover:scale-105">
                                <i class="fas fa-trash"></i> Delete {{ subtitle.language }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Video player -->
            <VideoPlayerModal :selectedVideo="selectedVideo" v-if="showVideoPlayerModal" @close="closeVideoPlayerModal" />
            <!-- Video upload form -->
            <VideoUploadForm v-if="showUploadForm" @close="closeUploadForm" @videoUploaded="handleVideoUploaded" />
        </section>
    </div>
    <footer class="text-center text-white pt-16 pb-8 text-md bg-gray-900">
        This web application created by sagar jangid.
    </footer>
</template>


<script>
import axios from 'axios';
import VideoPlayerModal from "./VideoPlayerModal.vue";
import VideoUploadForm from './VideoUploadForm.vue';
import { getAbsoluteUrl } from '../utils';


export default {
    components: {
        VideoPlayerModal,
        VideoUploadForm,
    },
    data() {
        return {
            videos: [],
            showVideoPlayerModal: false,
            selectedVideo: null,
            showUploadForm: false,
        };
    },
    async mounted() {
        await axios.get(getAbsoluteUrl("/api/videos/"))
            .then(response => {
                this.videos = response.data.data;
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            }
            );
    },
    methods: {
        getAbsoluteUrl,

        // Video player
        openVideoPlayerModal(video) {
            this.selectedVideo = video;
            this.showVideoPlayerModal = true;
        },
        closeVideoPlayerModal() {
            this.showVideoPlayerModal = false;
            this.selectedVideo = null;
        },

        // Video upload form
        handleVideoUploaded(video) {
            this.showUploadForm = false;
            this.videos.push(video.data); // update video list
        },
        openUploadForm() {
            this.showUploadForm = true;
        },
        closeUploadForm() {
            this.showUploadForm = false;
        },

        // Delete video
        async confirmVideoDelete(videoId) {
            const confirmation = confirm('Are you sure you want to delete this video?');
            if (confirmation) {
                try {
                    await this.deleteVideo(videoId);
                } catch (error) {
                    console.error('Error deleting video:', error);
                }
            }
        },
        async deleteVideo(videoId) {
            try {
                await axios.delete(getAbsoluteUrl(`/api/videos/${videoId}/`));
                // Update the videos array after successful deletion
                this.videos = this.videos.filter(video => video.id !== videoId);
            } catch (error) {
                console.error('Error deleting video:', error);
            }
        },

        // Delete subtitle
        async confirmSubtitleDelete(videoId, subtitleId) {
            const confirmation = confirm('Are you sure you want to delete this subtitle?');
            if (confirmation) {
                try {
                    await this.deleteSubtitle(videoId, subtitleId);
                } catch (error) {
                    console.error('Error deleting subtitle:', error);
                }
            }
        },
        async deleteSubtitle(videoId, subtitleId) {
            try {
                await axios.delete(getAbsoluteUrl(`/api/subtitles/${subtitleId}/`));
                // Update the videos array after successful subtitle deletion
                this.videos = this.videos.map(video => {
                    if (video.id === videoId) {
                        video.subtitle_files = video.subtitle_files.filter(subtitle => subtitle.id !== subtitleId);
                    }
                    return video;
                });

            } catch (error) {
                console.error('Error deleting video:', error);
            }
        }
    }
};
</script>


<style scoped></style>
