/**
 * ROUTE CONFIGURATION
 * Iceland Sound Route - Acoustic Heritage Collective
 * 
 * This file contains ALL route, audio, and media data.
 * 
 * IMPORTANT: All paths are relative to: https://acousticheritagecollective.org/iceland/
 */

export const routeConfig = {
  
  sections: [
    {
      id: 'section_1',
      name: 'Reykjavik to Selfoss',
      
      geoPath: [
        [64.1466, -21.9426],
        [64.1355, -21.8965],
        [64.1198, -21.8234],
        [64.0876, -21.7123],
        [64.0543, -21.5987],
        [64.0234, -21.4567],
        [63.9876, -21.3234],
        [63.9543, -21.1987],
        [63.9333, -20.9833]
      ],
      
      audioFiles: [
        { url: '/iceland/public/audio/section1/track_01.mp3', duration: 198 },  // 00:03:18
        { url: '/iceland/public/audio/section1/track_02.mp3', duration: 353 },  // 00:05:53
        { url: '/iceland/public/audio/section1/track_03.mp3', duration: 287 },  // 00:04:47
        { url: '/iceland/public/audio/section1/track_04.mp3', duration: 324 },  // 00:05:24
        { url: '/iceland/public/audio/section1/track_05.mp3', duration: 364 },  // 00:06:04
        { url: '/iceland/public/audio/section1/track_06.mp3', duration: 496 },  // 00:08:16
        { url: '/iceland/public/audio/section1/track_07.mp3', duration: 516 },  // 00:08:36
        { url: '/iceland/public/audio/section1/track_08.mp3', duration: 476 }   // 00:07:56
      ],
      
      mediaPool: {
        videos: [
          '/iceland/public/media/section1/videos/video_01.mp4',
          '/iceland/public/media/section1/videos/video_02.mp4',
          '/iceland/public/media/section1/videos/video_03.mp4',
          '/iceland/public/media/section1/videos/video_04.mp4',
          '/iceland/public/media/section1/videos/video_05.mp4'
        ],
        images: [
          '/iceland/public/media/section1/images/image_01.jpg',
          '/iceland/public/media/section1/images/image_02.jpg',
          '/iceland/public/media/section1/images/image_03.jpg',
          '/iceland/public/media/section1/images/image_04.jpg',
          '/iceland/public/media/section1/images/image_05.jpg',
          '/iceland/public/media/section1/images/image_06.jpg',
          '/iceland/public/media/section1/images/image_07.jpg',
          '/iceland/public/media/section1/images/image_08.jpg',
          '/iceland/public/media/section1/images/image_09.jpg',
          '/iceland/public/media/section1/images/image_10.jpg',
          '/iceland/public/media/section1/images/image_11.jpg',
          '/iceland/public/media/section1/images/image_12.jpg',
          '/iceland/public/media/section1/images/image_13.jpg',
          '/iceland/public/media/section1/images/image_14.jpg',
          '/iceland/public/media/section1/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_2',
      name: 'Selfoss to Vik',
      
      geoPath: [
        [63.9333, -20.9833],
        [63.8876, -20.7234],
        [63.8234, -20.4567],
        [63.7543, -20.1987],
        [63.6876, -19.8234],
        [63.6234, -19.5567],
        [63.5543, -19.2987],
        [63.4876, -19.1234],
        [63.4186, -19.0059]
      ],
      
      audioFiles: [
        { url: '/iceland/public/audio/section2/track_01.mp3', duration: 198 },
        { url: '/iceland/public/audio/section2/track_02.mp3', duration: 353 },
        { url: '/iceland/public/audio/section2/track_03.mp3', duration: 287 },
        { url: '/iceland/public/audio/section2/track_04.mp3', duration: 324 },
        { url: '/iceland/public/audio/section2/track_05.mp3', duration: 364 },
        { url: '/iceland/public/audio/section2/track_06.mp3', duration: 496 },
        { url: '/iceland/public/audio/section2/track_07.mp3', duration: 516 },
        { url: '/iceland/public/audio/section2/track_08.mp3', duration: 476 }
      ],
      
      mediaPool: {
        videos: [
          '/iceland/public/media/section2/videos/video_01.mp4',
          '/iceland/public/media/section2/videos/video_02.mp4',
          '/iceland/public/media/section2/videos/video_03.mp4',
          '/iceland/public/media/section2/videos/video_04.mp4',
          '/iceland/public/media/section2/videos/video_05.mp4'
        ],
        images: [
          '/iceland/public/media/section2/images/image_01.jpg',
          '/iceland/public/media/section2/images/image_02.jpg',
          '/iceland/public/media/section2/images/image_03.jpg',
          '/iceland/public/media/section2/images/image_04.jpg',
          '/iceland/public/media/section2/images/image_05.jpg',
          '/iceland/public/media/section2/images/image_06.jpg',
          '/iceland/public/media/section2/images/image_07.jpg',
          '/iceland/public/media/section2/images/image_08.jpg',
          '/iceland/public/media/section2/images/image_09.jpg',
          '/iceland/public/media/section2/images/image_10.jpg',
          '/iceland/public/media/section2/images/image_11.jpg',
          '/iceland/public/media/section2/images/image_12.jpg',
          '/iceland/public/media/section2/images/image_13.jpg',
          '/iceland/public/media/section2/images/image_14.jpg',
          '/iceland/public/media/section2/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_3',
      name: 'Vik to Hofn',
      
      geoPath: [
        [63.4186, -19.0059],
        [63.5234, -18.6567],
        [63.6543, -18.2987],
        [63.7876, -17.8234],
        [63.9234, -17.3567],
        [64.0543, -16.8987],
        [64.1234, -16.4567],
        [64.1876, -15.9234],
        [64.2539, -15.2082]
      ],
      
      audioFiles: [
        { url: '/iceland/public/audio/section3/track_01.mp3', duration: 198 },
        { url: '/iceland/public/audio/section3/track_02.mp3', duration: 353 },
        { url: '/iceland/public/audio/section3/track_03.mp3', duration: 287 },
        { url: '/iceland/public/audio/section3/track_04.mp3', duration: 324 },
        { url: '/iceland/public/audio/section3/track_05.mp3', duration: 364 },
        { url: '/iceland/public/audio/section3/track_06.mp3', duration: 496 },
        { url: '/iceland/public/audio/section3/track_07.mp3', duration: 516 },
        { url: '/iceland/public/audio/section3/track_08.mp3', duration: 476 }
      ],
      
      mediaPool: {
        videos: [
          '/iceland/public/media/section3/videos/video_01.mp4',
          '/iceland/public/media/section3/videos/video_02.mp4',
          '/iceland/public/media/section3/videos/video_03.mp4',
          '/iceland/public/media/section3/videos/video_04.mp4',
          '/iceland/public/media/section3/videos/video_05.mp4'
        ],
        images: [
          '/iceland/public/media/section3/images/image_01.jpg',
          '/iceland/public/media/section3/images/image_02.jpg',
          '/iceland/public/media/section3/images/image_03.jpg',
          '/iceland/public/media/section3/images/image_04.jpg',
          '/iceland/public/media/section3/images/image_05.jpg',
          '/iceland/public/media/section3/images/image_06.jpg',
          '/iceland/public/media/section3/images/image_07.jpg',
          '/iceland/public/media/section3/images/image_08.jpg',
          '/iceland/public/media/section3/images/image_09.jpg',
          '/iceland/public/media/section3/images/image_10.jpg',
          '/iceland/public/media/section3/images/image_11.jpg',
          '/iceland/public/media/section3/images/image_12.jpg',
          '/iceland/public/media/section3/images/image_13.jpg',
          '/iceland/public/media/section3/images/image_14.jpg',
          '/iceland/public/media/section3/images/image_15.jpg'
        ]
      }
    },
    
    {
      id: 'section_4',
      name: 'Hofn back to Reykjavik',
      
      geoPath: [
        [64.2539, -15.2082],
        [64.3234, -15.8567],
        [64.3876, -16.4987],
        [64.4234, -17.1567],
        [64.4543, -17.8234],
        [64.3876, -18.4987],
        [64.2876, -19.2234],
        [64.1876, -20.3567],
        [64.1466, -21.9426]
      ],
      
      audioFiles: [
        { url: '/iceland/public/audio/section4/track_01.mp3', duration: 198 },
        { url: '/iceland/public/audio/section4/track_02.mp3', duration: 353 },
        { url: '/iceland/public/audio/section4/track_03.mp3', duration: 287 },
        { url: '/iceland/public/audio/section4/track_04.mp3', duration: 324 },
        { url: '/iceland/public/audio/section4/track_05.mp3', duration: 364 },
        { url: '/iceland/public/audio/section4/track_06.mp3', duration: 496 },
        { url: '/iceland/public/audio/section4/track_07.mp3', duration: 516 },
        { url: '/iceland/public/audio/section4/track_08.mp3', duration: 476 }
      ],
      
      mediaPool: {
        videos: [
          '/iceland/public/media/section4/videos/video_01.mp4',
          '/iceland/public/media/section4/videos/video_02.mp4',
          '/iceland/public/media/section4/videos/video_03.mp4',
          '/iceland/public/media/section4/videos/video_04.mp4',
          '/iceland/public/media/section4/videos/video_05.mp4'
        ],
        images: [
          '/iceland/public/media/section4/images/image_01.jpg',
          '/iceland/public/media/section4/images/image_02.jpg',
          '/iceland/public/media/section4/images/image_03.jpg',
          '/iceland/public/media/section4/images/image_04.jpg',
          '/iceland/public/media/section4/images/image_05.jpg',
          '/iceland/public/media/section4/images/image_06.jpg',
          '/iceland/public/media/section4/images/image_07.jpg',
          '/iceland/public/media/section4/images/image_08.jpg',
          '/iceland/public/media/section4/images/image_09.jpg',
          '/iceland/public/media/section4/images/image_10.jpg',
          '/iceland/public/media/section4/images/image_11.jpg',
          '/iceland/public/media/section4/images/image_12.jpg',
          '/iceland/public/media/section4/images/image_13.jpg',
          '/iceland/public/media/section4/images/image_14.jpg',
          '/iceland/public/media/section4/images/image_15.jpg'
        ]
      }
    }
  ]
};