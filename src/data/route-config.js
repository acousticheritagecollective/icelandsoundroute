/**
 * ROUTE CONFIGURATION
 * 
 * This file contains ALL route, audio, and media data.
 * When you have your final audio exports and GPS data, you only need to edit this file.
 * 
 * STRUCTURE:
 * - sections: Array of 4 route sections
 * - Each section contains:
 *   - id: Unique identifier
 *   - name: Descriptive name (for debugging)
 *   - geoPath: Array of [lat, lng] coordinates defining the route segment
 *   - audioFiles: Array of audio tracks (IN ORDER, they play sequentially)
 *   - mediaPool: Object with videos and images arrays (randomly selected)
 * 
 * NOTES:
 * - Section durations are auto-calculated from audio file durations
 * - Total duration is auto-calculated from all sections
 * - geoPath will be generated from your GPS track file
 */

export const routeConfig = {
  
  sections: [
    {
      id: 'section_1',
      name: 'Reykjavik to Selfoss',
      
      // Geographic path for this section
      // Format: Array of [latitude, longitude] pairs
      // This is PLACEHOLDER data - will be replaced with your actual GPS track
      geoPath: [
        [64.1466, -21.9426], // Reykjavik start
        [64.1355, -21.8965],
        [64.1198, -21.8234],
        [64.0876, -21.7123],
        [64.0543, -21.5987],
        [64.0234, -21.4567],
        [63.9876, -21.3234],
        [63.9543, -21.1987],
        [63.9333, -20.9833]  // Selfoss
      ],
      
      // Audio files for this section - PLAY IN ORDER
      // You will replace these with your actual track URLs and durations
      audioFiles: [
        { 
          url: '/public/audio/section1/track_01.mp3', 
          duration: 612  // 10min 12sec (placeholder)
        },
        { 
          url: '/public/audio/section1/track_02.mp3', 
          duration: 578  // 9min 38sec
        },
        { 
          url: '/public/audio/section1/track_03.mp3', 
          duration: 645  // 10min 45sec
        },
        { 
          url: '/public/audio/section1/track_04.mp3', 
          duration: 523  // 8min 43sec
        },
        { 
          url: '/public/audio/section1/track_05.mp3', 
          duration: 691  // 11min 31sec
        },
        { 
          url: '/public/audio/section1/track_06.mp3', 
          duration: 598  // 9min 58sec
        },
        { 
          url: '/public/audio/section1/track_07.mp3', 
          duration: 512  // 8min 32sec
        },
        { 
          url: '/public/audio/section1/track_08.mp3', 
          duration: 589  // 9min 49sec
        }
      ],
      
      // Media pool for this section - RANDOMLY SELECTED
      // Mix of videos and images, ~50-60 items per section
      // PLACEHOLDER - you will replace with your actual media files
      mediaPool: {
        videos: [
          '/public/media/section1/videos/video_01.mp4',
          '/public/media/section1/videos/video_02.mp4',
          '/public/media/section1/videos/video_03.mp4',
          '/public/media/section1/videos/video_04.mp4',
          '/public/media/section1/videos/video_05.mp4'
        ],
        images: [
          '/public/media/section1/images/image_01.jpg',
          '/public/media/section1/images/image_02.jpg',
          '/public/media/section1/images/image_03.jpg',
          '/public/media/section1/images/image_04.jpg',
          '/public/media/section1/images/image_05.jpg',
          '/public/media/section1/images/image_06.jpg',
          '/public/media/section1/images/image_07.jpg',
          '/public/media/section1/images/image_08.jpg',
          '/public/media/section1/images/image_09.jpg',
          '/public/media/section1/images/image_10.jpg',
          '/public/media/section1/images/image_11.jpg',
          '/public/media/section1/images/image_12.jpg',
          '/public/media/section1/images/image_13.jpg',
          '/public/media/section1/images/image_14.jpg',
          '/public/media/section1/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_2',
      name: 'Selfoss to Vik',
      
      geoPath: [
        [63.9333, -20.9833], // Selfoss
        [63.8876, -20.7234],
        [63.8234, -20.4567],
        [63.7543, -20.1987],
        [63.6876, -19.8234],
        [63.6234, -19.5567],
        [63.5543, -19.2987],
        [63.4876, -19.1234],
        [63.4186, -19.0059]  // Vik
      ],
      
      audioFiles: [
        { url: '/public/audio/section2/track_09.mp3', duration: 634 },
        { url: '/public/audio/section2/track_10.mp3', duration: 556 },
        { url: '/public/audio/section2/track_11.mp3', duration: 678 },
        { url: '/public/audio/section2/track_12.mp3', duration: 501 },
        { url: '/public/audio/section2/track_13.mp3', duration: 612 },
        { url: '/public/audio/section2/track_14.mp3', duration: 589 },
        { url: '/public/audio/section2/track_15.mp3', duration: 545 },
        { url: '/public/audio/section2/track_16.mp3', duration: 623 }
      ],
      
      mediaPool: {
        videos: [
          '/public/media/section2/videos/video_01.mp4',
          '/public/media/section2/videos/video_02.mp4',
          '/public/media/section2/videos/video_03.mp4',
          '/public/media/section2/videos/video_04.mp4',
          '/public/media/section2/videos/video_05.mp4'
        ],
        images: [
          '/public/media/section2/images/image_01.jpg',
          '/public/media/section2/images/image_02.jpg',
          '/public/media/section2/images/image_03.jpg',
          '/public/media/section2/images/image_04.jpg',
          '/public/media/section2/images/image_05.jpg',
          '/public/media/section2/images/image_06.jpg',
          '/public/media/section2/images/image_07.jpg',
          '/public/media/section2/images/image_08.jpg',
          '/public/media/section2/images/image_09.jpg',
          '/public/media/section2/images/image_10.jpg',
          '/public/media/section2/images/image_11.jpg',
          '/public/media/section2/images/image_12.jpg',
          '/public/media/section2/images/image_13.jpg',
          '/public/media/section2/images/image_14.jpg',
          '/public/media/section2/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_3',
      name: 'Vik to Hofn',
      
      geoPath: [
        [63.4186, -19.0059], // Vik
        [63.5234, -18.6567],
        [63.6543, -18.2987],
        [63.7876, -17.8234],
        [63.9234, -17.3567],
        [64.0543, -16.8987],
        [64.1234, -16.4567],
        [64.1876, -15.9234],
        [64.2539, -15.2082]  // Hofn
      ],
      
      audioFiles: [
        { url: '/public/audio/section3/track_17.mp3', duration: 598 },
        { url: '/public/audio/section3/track_18.mp3', duration: 623 },
        { url: '/public/audio/section3/track_19.mp3', duration: 567 },
        { url: '/public/audio/section3/track_20.mp3', duration: 634 },
        { url: '/public/audio/section3/track_21.mp3', duration: 589 },
        { url: '/public/audio/section3/track_22.mp3', duration: 612 },
        { url: '/public/audio/section3/track_23.mp3', duration: 545 },
        { url: '/public/audio/section3/track_24.mp3', duration: 601 }
      ],
      
      mediaPool: {
        videos: [
          '/public/media/section3/videos/video_01.mp4',
          '/public/media/section3/videos/video_02.mp4',
          '/public/media/section3/videos/video_03.mp4',
          '/public/media/section3/videos/video_04.mp4',
          '/public/media/section3/videos/video_05.mp4'
        ],
        images: [
          '/public/media/section3/images/image_01.jpg',
          '/public/media/section3/images/image_02.jpg',
          '/public/media/section3/images/image_03.jpg',
          '/public/media/section3/images/image_04.jpg',
          '/public/media/section3/images/image_05.jpg',
          '/public/media/section3/images/image_06.jpg',
          '/public/media/section3/images/image_07.jpg',
          '/public/media/section3/images/image_08.jpg',
          '/public/media/section3/images/image_09.jpg',
          '/public/media/section3/images/image_10.jpg',
          '/public/media/section3/images/image_11.jpg',
          '/public/media/section3/images/image_12.jpg',
          '/public/media/section3/images/image_13.jpg',
          '/public/media/section3/images/image_14.jpg',
          '/public/media/section3/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_4',
      name: 'Hofn back to Reykjavik',
      
      geoPath: [
        [64.2539, -15.2082], // Hofn
        [64.3234, -15.8567],
        [64.3876, -16.4987],
        [64.4234, -17.1567],
        [64.4543, -17.8234],
        [64.3876, -18.4987],
        [64.2876, -19.2234],
        [64.1876, -20.3567],
        [64.1466, -21.9426]  // Reykjavik (end)
      ],
      
      audioFiles: [
        { url: '/public/audio/section4/track_25.mp3', duration: 612 },
        { url: '/public/audio/section4/track_26.mp3', duration: 578 },
        { url: '/public/audio/section4/track_27.mp3', duration: 623 },
        { url: '/public/audio/section4/track_28.mp3', duration: 556 },
        { url: '/public/audio/section4/track_29.mp3', duration: 634 },
        { url: '/public/audio/section4/track_30.mp3', duration: 589 },
        { url: '/public/audio/section4/track_31.mp3', duration: 601 },
        { url: '/public/audio/section4/track_32.mp3', duration: 595 }
      ],
      
      mediaPool: {
        videos: [
          '/public/media/section4/videos/video_01.mp4',
          '/public/media/section4/videos/video_02.mp4',
          '/public/media/section4/videos/video_03.mp4',
          '/public/media/section4/videos/video_04.mp4',
          '/public/media/section4/videos/video_05.mp4'
        ],
        images: [
          '/public/media/section4/images/image_01.jpg',
          '/public/media/section4/images/image_02.jpg',
          '/public/media/section4/images/image_03.jpg',
          '/public/media/section4/images/image_04.jpg',
          '/public/media/section4/images/image_05.jpg',
          '/public/media/section4/images/image_06.jpg',
          '/public/media/section4/images/image_07.jpg',
          '/public/media/section4/images/image_08.jpg',
          '/public/media/section4/images/image_09.jpg',
          '/public/media/section4/images/image_10.jpg',
          '/public/media/section4/images/image_11.jpg',
          '/public/media/section4/images/image_12.jpg',
          '/public/media/section4/images/image_13.jpg',
          '/public/media/section4/images/image_14.jpg',
          '/public/media/section4/images/image_15.jpg'
        ]
      }
    }
  ]
};
