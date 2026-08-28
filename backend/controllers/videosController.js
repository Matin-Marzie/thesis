import LanguageSchema from '../validation/LanguageSchema.js';
import videosModel from '../models/videosModel.js';

const videosController = {
  async getVideos(req, res) {
    try {
      const { language_code } = req.params;

      const { error } = LanguageSchema.validate({ code: language_code });

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const videos = await videosModel.getVideosByLanguageCode(language_code);

      res.json({
        language_code: language_code,
        videos,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  },
};

export default videosController;
