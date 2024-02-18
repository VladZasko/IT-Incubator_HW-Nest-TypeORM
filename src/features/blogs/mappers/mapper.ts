export const blogMapper = (blogDb: any) => {
  return {
    id: blogDb._id.toString(),
    name: blogDb.name,
    description: blogDb.description,
    websiteUrl: blogDb.websiteUrl,
    createdAt: blogDb.createdAt,
    isMembership: blogDb.isMembership,
  };
};
