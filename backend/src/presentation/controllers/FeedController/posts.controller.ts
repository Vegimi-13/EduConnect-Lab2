import { Request, Response, NextFunction } from "express";
import postService from "../../../business/services/posts.service";
import { FeedQueryDto } from "../../../business/dto/Feed/posts.dto";

export const postController = {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const post = await postService.createPost(user.userId, req.body);

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      // if you used Zod transform → already number

      const postId = Number(req.params.id);

      const post = await postService.getPostById(postId);

      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const queryResult = FeedQueryDto.safeParse(req.query);

      if (!queryResult.success) {
        return res.status(400).json({
          message: "Invalid feed query",
          errors: queryResult.error.flatten().fieldErrors,
        });
      }

      const feed = await postService.getFeed(user.userId, queryResult.data);

      res.status(200).json(feed);
    } catch (error) {
      next(error);
    }
  },
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const postId = Number(req.params.id);

      const updatedPost = await postService.updatePost(
        user.userId,

        postId,

        req.body,
      );

      res.status(200).json(updatedPost);
    } catch (error) {
      next(error);
    }
  },
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const postId = Number(req.params.id);

      await postService.deletePost(user.userId, postId);

      res.status(200).json({
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async sharePost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const postId = Number(req.params.id);
      const result = await postService.sharePost(
        user.userId,
        postId,
        req.body.content,
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
};
