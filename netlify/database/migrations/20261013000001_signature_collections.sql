-- Existing site copies retain their own published and draft text/media. No draft is promoted.
CREATE FUNCTION m4_upgrade_content(value jsonb) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN value ? 'storyPanels' THEN value ELSE jsonb_set(value, '{storyPanels}',
    jsonb_build_array(
      jsonb_build_object('id','legacy-introduction','enabled',true,'layout','intro',
        'title',value->>'storyTitle','body',jsonb_build_array(value->>'intro'),
        'images',jsonb_build_array(COALESCE(value->'gallery'->0,value->'hero')),'caption',''),
      jsonb_build_object('id','legacy-story','enabled',true,'layout','editorial',
        'title',value->>'storyTitle','body',jsonb_build_array(value->>'story'),
        'images',jsonb_build_array(COALESCE(value->'gallery'->1,value->'hero')),'caption','')
    ), true) END
$$;
--> statement-breakpoint
UPDATE sites SET draft = m4_upgrade_content(draft), published = m4_upgrade_content(published);
--> statement-breakpoint
UPDATE revisions SET content = m4_upgrade_content(content);
--> statement-breakpoint
DROP FUNCTION m4_upgrade_content(jsonb);
