import express from 'express';
import { unrollThread as unrollThread} from './public.js';

export const router = express.Router();
import {
  getNote
} from '../lib/account.js';
import dotenv from 'dotenv';
dotenv.config();

const {
  DOMAIN
} = process.env;

router.get('/:guid', async (req, res) => {
  let guid = req.params.guid;
  if (!guid) {
    return res.status(400).send('Bad request.');
  } else {
    const note = await getNote(`https://${ DOMAIN }/m/${ guid }`);
    if (note === undefined) {
      return res.status(404).send(`No record found for ${guid}.`);
    } else {
      // PMCif (req.headers.accept?.includes('application/ld+json; profile="https://www.w3.org/ns/activitystreams"')) {
        res.json(note);
      //} else {
      //  res.redirect(note.url);
      //}
    }
  }
});

// New function to get all replies to one specific post
router.get('/:guid/replies', async (req, res) => {
  let guid = req.params.guid;
  if (!guid) {
    return res.status(400).send('Bad request.');
  } else {
    const note = await getNote(`https://${ DOMAIN }/m/${ guid }`);
    if (note === undefined) {
      return res.status(404).send(`No record found for ${guid}.`);
    } else {
      // PMCif (req.headers.accept?.includes('application/ld+json; profile="https://www.w3.org/ns/activitystreams"')) {    
        const notes = await unrollThread(note.id);
        notes.sort((a, b) => {
          const ad = new Date(a.note.published).getTime();
          const bd = new Date(b.note.published).getTime();
          if (ad > bd) {
            return 1;
          } else if (ad < bd) {
            return -1;
          } else {
            return 0;
          }
        });
        // Remove the first note from the array (which is the oringal post)
        notes.shift();
        // Currently displays all replies, including replies-to-replies
        res.json(notes);
      //} else {
      //  res.redirect(note.url);
      //}      
    }
  }
});
