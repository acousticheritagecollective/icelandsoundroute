/**
 * ROUTE CONFIGURATION
 * 
 * Real GPS route data for Iceland Sound Route installation
 */

export const routeConfig = {
  sections: [
    {
      id: 'section_1',
      name: 'Flúðir to Höfn',
      geoPath: [
        [64.1108, -20.3003],
        [64.0500, -20.5000],
        [63.9500, -20.8000],
        [63.8500, -21.1000],
        [63.7500, -21.4000],
        [63.6500, -21.7000],
        [63.5300, -19.0100],
        [63.5500, -18.5000],
        [63.6000, -18.0000],
        [63.7000, -17.5000],
        [63.8000, -17.0000],
        [63.9000, -16.5000],
        [64.0000, -16.0000],
        [64.1000, -15.5000],
        [64.2547, -15.2080]
      ],
      audioFiles: [
        { url: '/iceland/public/audio/section1/track_01.mp3', duration: 198 },
        { url: '/iceland/public/audio/section1/track_02.mp3', duration: 353 },
        { url: '/iceland/public/audio/section1/track_03.mp3', duration: 287 },
        { url: '/iceland/public/audio/section1/track_04.mp3', duration: 324 },
        { url: '/iceland/public/audio/section1/track_05.mp3', duration: 364 },
        { url: '/iceland/public/audio/section1/track_06.mp3', duration: 496 },
        { url: '/iceland/public/audio/section1/track_07.mp3', duration: 516 },
        { url: '/iceland/public/audio/section1/track_08.mp3', duration: 476 }
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
      name: 'Höfn to Mývatn',
      geoPath: [
        [64.2547, -15.2080],
        [64.3000, -15.0000],
        [64.4000, -14.8000],
        [64.5000, -14.5000],
        [64.6000, -14.3000],
        [64.7000, -14.1000],
        [64.8000, -14.0000],
        [64.9000, -14.2000],
        [65.0000, -14.5000],
        [65.1000, -14.8000],
        [65.2000, -15.2000],
        [65.3000, -15.8000],
        [65.4000, -16.5000],
        [65.5000, -17.0000],
        [65.5941, -16.9181]
      ],
      audioFiles: [
        { url: '/iceland/public/audio/section2/track_09.mp3', duration: 198 },
        { url: '/iceland/public/audio/section2/track_10.mp3', duration: 353 },
        { url: '/iceland/public/audio/section2/track_11.mp3', duration: 287 },
        { url: '/iceland/public/audio/section2/track_12.mp3', duration: 324 },
        { url: '/iceland/public/audio/section2/track_13.mp3', duration: 364 },
        { url: '/iceland/public/audio/section2/track_14.mp3', duration: 496 },
        { url: '/iceland/public/audio/section2/track_15.mp3', duration: 516 },
        { url: '/iceland/public/audio/section2/track_16.mp3', duration: 476 }
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
      name: 'Mývatn to Sauðárkrókur',
      geoPath: [
        [65.5941, -16.9181],
        [65.6000, -17.3000],
        [65.6500, -17.8000],
        [65.7000, -18.3000],
        [65.7500, -18.8000],
        [65.7800, -19.3000],
        [65.7500, -19.8000],
        [65.7000, -20.3000],
        [65.6500, -20.8000],
        [65.6000, -21.3000],
        [65.7474, -19.6390]
      ],
      audioFiles: [
        { url: '/iceland/public/audio/section3/track_17.mp3', duration: 198 },
        { url: '/iceland/public/audio/section3/track_18.mp3', duration: 353 },
        { url: '/iceland/public/audio/section3/track_19.mp3', duration: 287 },
        { url: '/iceland/public/audio/section3/track_20.mp3', duration: 324 },
        { url: '/iceland/public/audio/section3/track_21.mp3', duration: 364 },
        { url: '/iceland/public/audio/section3/track_22.mp3', duration: 496 },
        { url: '/iceland/public/audio/section3/track_23.mp3', duration: 516 },
        { url: '/iceland/public/audio/section3/track_24.mp3', duration: 476 }
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
      name: 'Sauðárkrókur to Reykjavík',
      geoPath: [
        [65.7474, -19.6390],
        [65.6000, -20.5000],
        [65.5000, -21.0000],
        [65.4000, -21.5000],
        [65.2000, -21.8000],
        [65.0000, -22.0000],
        [64.8000, -22.2000],
        [64.6000, -22.3000],
        [64.4000, -22.2000],
        [64.2000, -22.0000],
        [64.1000, -21.8000],
        [64.1476, -21.9426]
      ],
      audioFiles: [
        { url: '/iceland/public/audio/section4/track_25.mp3', duration: 198 },
        { url: '/iceland/public/audio/section4/track_26.mp3', duration: 353 },
        { url: '/iceland/public/audio/section4/track_27.mp3', duration: 287 },
        { url: '/iceland/public/audio/section4/track_28.mp3', duration: 324 },
        { url: '/iceland/public/audio/section4/track_29.mp3', duration: 364 },
        { url: '/iceland/public/audio/section4/track_30.mp3', duration: 496 },
        { url: '/iceland/public/audio/section4/track_31.mp3', duration: 516 },
        { url: '/iceland/public/audio/section4/track_32.mp3', duration: 476 }
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
